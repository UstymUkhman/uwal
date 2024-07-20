import { CreateConstantObject } from "@/Utils";
import { ERROR, ThrowError } from "@/Errors";
import { vec2, mat3 } from "wgpu-matrix";
import { NUMBER } from "@/Constants";

export default class Shape
{
    #Renderer;
    #Radius; #Angle = 0;
    #MatrixUpdate = false;

    #Origin = mat3.create();
    #Scaling = mat3.create();
    #Rotation = mat3.create();
    #Translation = mat3.create();

    /** @type {string} */ #Label;
    /** @type {number} */ #Segments;
    /** @type {number} */ #Vertices;

    /** @type {GPUBuffer} */ #IndexBuffer;
    /** @type {GPUBuffer} */ #VertexBuffer;
    /** @type {GPUBuffer} */ #UniformBuffer;
    /** @type {GPUBindGroup} */ #BindGroup;

    #BBox = { min: vec2.create(), max: vec2.create() };
    #Size = CreateConstantObject({ color: 4, matrix: 12 });
    #Offset = CreateConstantObject({ color: 0, matrix: 4 });

    /** @type {Vec2} */ #Scale    = new Float32Array([1, 1]);
    /** @type {Vec2} */ #Pivot    = new Float32Array([0, 0]);
    /** @type {Vec2} */ #Center   = new Float32Array([0, 0]);
    /** @type {Vec2} */ #Position = new Float32Array([0, 0]);

    #Uniform = new Float32Array(this.#Size.color + this.#Size.matrix);
    #Color = this.#Uniform.subarray(this.#Offset.color, this.#Offset.color + this.#Size.color);
    #Matrix = this.#Uniform.subarray(this.#Offset.matrix, this.#Offset.matrix + this.#Size.matrix);

    /**
     * @typedef {Object} ShapeDescriptor
     * @property {import("../pipelines").RenderPipeline} renderer
     * @property {number} [segments]
     * @property {string} [label = "Shape"]
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = NUMBER.TAU]
     * @param {ShapeDescriptor} descriptor
     */
    constructor(descriptor)
    {
        !descriptor.segments && ThrowError(ERROR.REQUIRED_SEGMENTS);

        this.#Label = descriptor.label ?? "Shape";
        this.#Radius = descriptor.radius ?? 0;
        this.#Renderer = descriptor.renderer;
        this.#Segments = descriptor.segments;

        const { startAngle, endAngle, innerRadius } = descriptor;
        this.#CreateVertexBuffer(startAngle, endAngle, innerRadius);

        this.#CreateIndexBuffer();
        this.#CreateUniformBuffer();

        this.Scale = this.#Scale;
        this.Origin = this.#Pivot;
        this.Rotation = this.#Angle;
        this.Position = this.#Position;
    }

    /**
     * @param {number} [startAngle = 0]
     * @param {number} [endAngle = NUMBER.TAU]
     * @param {number} [innerRadius = 0]
     */
    #CreateVertexBuffer(startAngle = 0, endAngle = NUMBER.TAU, innerRadius = 0)
    {
        const theta = endAngle - startAngle;

        // Two vertices per segment and one more to wrap around:
        const vertexData = new Float32Array((this.#Segments + 1) * 2 * (2 + 1));

        for (let offset = 0, s = 0; s <= this.#Segments; ++s)
        {
            const angle = startAngle + s * theta / this.#Segments;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            vertexData[offset++] = cos * this.#Radius;
            vertexData[offset++] = sin * this.#Radius;

            vertexData[offset++] = cos * innerRadius;
            vertexData[offset++] = sin * innerRadius;
        }

        this.#VertexBuffer = this.#Renderer.CreateBuffer(
        {
            size: vertexData.byteLength,
            label: `${this.#Label} Vertex Buffer`,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(this.#VertexBuffer, vertexData);
    }

    #CreateIndexBuffer()
    {
        const indexData = new Uint32Array(this.#Vertices = this.#Segments * 6);

        for (let index = 0, i = 0; i < this.#Segments; ++i)
        {
            const offset = i * 2;

            indexData[index++] = offset + 1; // 0 _____ 2
            indexData[index++] = offset + 3; //  |    /|
            indexData[index++] = offset + 2; //  |   / |
            indexData[index++] = offset + 2; //  |  /  |
            indexData[index++] = offset + 0; //  | /   |
            indexData[index++] = offset + 1; // 1|/____|3
        }

        this.#IndexBuffer = this.#Renderer.CreateBuffer(
        {
            size: indexData.byteLength,
            label: `${this.#Label} Index Buffer`,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(this.#IndexBuffer, indexData);
    }

    #CreateUniformBuffer()
    {
        this.#UniformBuffer = this.#Renderer.CreateBuffer(
        {
            size: this.#Uniform.length * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            label: `${this.#Label} Uniform Buffer`
        });

        this.#BindGroup = this.#Renderer.CreateBindGroup(
            this.#Renderer.CreateBindGroupEntries(
            [
                { buffer: this.#Renderer.ResolutionBuffer },
                { buffer: this.#UniformBuffer }
            ]), 0, `${this.#Label} Bind Group`
        );
    }

    #UpdateMatrix()
    {
        if (this.#MatrixUpdate)
        {
            mat3.multiply(this.#Translation, this.#Rotation, this.#Matrix);
            mat3.multiply(this.#Matrix, this.#Scaling, this.#Matrix);
            mat3.multiply(this.#Matrix, this.#Origin, this.#Matrix);

            this.#Renderer.WriteBuffer(this.#UniformBuffer, this.#Uniform);

            const x = this.#Center[0] = this.#Matrix[8];
            const y = this.#Center[1] = this.#Matrix[9];

            this.#BBox.min[0] = x - this.#Radius;
            this.#BBox.min[1] = y - this.#Radius;

            this.#BBox.max[0] = x + this.#Radius;
            this.#BBox.max[1] = y + this.#Radius;

            this.#MatrixUpdate = false;
        }

        return this;
    }

    Update()
    {
        this.#Renderer.SetVertexBuffers(this.#VertexBuffer);
        this.#Renderer.SetIndexBuffer(this.#IndexBuffer);
        this.#Renderer.SetBindGroups(this.#BindGroup);

        return this.#UpdateMatrix();
    }

    /** @param {boolean} [submit = true] */
    Render(submit = true)
    {
        this.#Renderer.SavePipelineState();
        this.#Renderer.Render(this.Update().#Vertices, submit);
        this.#Renderer.RestorePipelineState();
    }

    /** @param {import("../Color").default | Vec4 | Vec4n} color */
    set Color(color)
    {
        this.#Color.set(Array.isArray(color) || ArrayBuffer.isView(color) ? color : color.rgba);
        this.#Renderer.WriteBuffer(this.#UniformBuffer, this.#Uniform);
    }

    get Color()
    {
        return this.#Color;
    }

    /** @param {Vec2 | Vec2n} position */
    set Position(position)
    {
        this.#Position.set(position);
        mat3.translation(this.#Position, this.#Translation);
        this.#MatrixUpdate = true;
    }

    get Position()
    {
        return this.#Position;
    }

    /** @param {number} rotation */
    set Rotation(rotation)
    {
        mat3.rotation(this.#Angle = rotation, this.#Rotation);
        this.#MatrixUpdate = true;
    }

    get Rotation()
    {
        return this.#Angle;
    }

    /** @param {Vec2 | Vec2n} scale */
    set Scale(scale)
    {
        this.#Scale.set(scale);
        mat3.scaling(this.#Scale, this.#Scaling);
        this.#MatrixUpdate = true;
    }

    get Scale()
    {
        return this.#Scale;
    }

    /** @param {Vec2 | Vec2n} origin */
    set Origin(origin)
    {
        this.#Pivot[0] = origin[0];      //       -1
        this.#Pivot[1] = origin[1];      //        |
                                         // -1 --- 0 --- 1
        this.#Pivot[0] *= -this.#Radius; //        |
        this.#Pivot[1] *= -this.#Radius; //        1

        mat3.translation(this.#Pivot, this.#Origin);

        // Remove negative sign when `-0`:
        this.#Pivot[0] = origin[0] || 0;
        this.#Pivot[1] = origin[1] || 0;

        this.#MatrixUpdate = true;
    }

    get Origin()
    {
        return this.#Pivot;
    }

    get Center()
    {
        return this.#UpdateMatrix().#Center;
    }

    get Vertices()
    {
        return this.#Vertices;
    }

    get Transform()
    {
        return this.#Matrix;
    }

    get BoundingBox()
    {
        return this.#BBox;
    }
}
