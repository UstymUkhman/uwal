import { CreateConstantObject } from "@/Utils";
// import { SEGMENTS } from "@/shapes/Constants";
import { ERROR, ThrowError } from "@/Errors";
import { NUMBER } from "@/Constants";
import { mat3 } from "wgpu-matrix";

export default class Shape
{
    #Renderer;
    #IndexData;
    #VertexData;

    #Radius; #Angle = 0;
    #MatrixUpdate = false;

    #Origin = mat3.create();
    #Scaling = mat3.create();
    #Rotation = mat3.create();
    #Translation = mat3.create();

    /** @type {string} */ #Label;
    /** @type {number} */ #Segments;
    /** @type {number} */ #Vertices;

    /** @type {Float32Array} */ #Color;
    /** @type {Float32Array} */ #Matrix;
    /** @type {Float32Array} */ #Uniform;

    /** @type {GPUBuffer} */ #VertexBuffer;
    /** @type {GPUBuffer} */ #IndexBuffer;
    /** @type {GPUBuffer} */ #UniformBuffer;
    /** @type {GPUBindGroup} */ #BindGroup;

    /** @type {Vec2} */ #Scale    = [1, 1];
    /** @type {Vec2} */ #Pivot    = [0, 0];
    /** @type {Vec2} */ #Center   = [0, 0];
    /** @type {Vec2} */ #Position = [0, 0];

    #Size = CreateConstantObject({ color: 4, matrix: 12 });
    #Offset = CreateConstantObject({ color: 0, matrix: 4 });

    /**
     * @typedef {import("./Constants").ShapeSegments[import("./Constants").ShapeType]} ShapeSegments
     *
     * @typedef {Object} ShapeDescriptor
     * @property {import("../pipelines").RenderPipeline} renderer
     * @property {ShapeSegments} [segments = SEGMENTS.CUSTOM]
     * @property {string} [label = undefined]
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = NUMBER.TAU]
     * @param {ShapeDescriptor} descriptor
     */
    constructor(descriptor)
    {
        if (!descriptor.segments) ThrowError(ERROR.REQUIRED_SEGMENTS);

        this.#Label = descriptor.label ?? "Shape";
        this.#Radius = descriptor.radius ?? 0;
        this.#Renderer = descriptor.renderer;
        this.#Segments = descriptor.segments;

        // Two vertices per segment and one more to wrap around:
        this.#VertexData = new Float32Array((this.#Segments + 1) * 2 * (2 + 1));
        this.#IndexData = new Uint32Array(this.#Vertices = this.#Segments * 6);

        const { startAngle, endAngle, innerRadius } = descriptor;
        this.#CreateVertices(startAngle, endAngle, innerRadius);

        this.#CreateIndices();
        this.#CreateBuffers();

        this.Scale = this.#Scale;
        this.Origin = this.#Pivot;
        this.Rotation = this.#Angle;
        this.Position = this.#Position;

        // Reset initial `this.#Pivot` sign:
        this.#Pivot[0] = 0; this.#Pivot[1] = 0;

        this.#Color = this.#Uniform.subarray(this.#Offset.color, this.#Offset.color + this.#Size.color);
        this.#Matrix = this.#Uniform.subarray(this.#Offset.matrix, this.#Offset.matrix + this.#Size.matrix);
    }

    /**
     * @param {number} [startAngle = 0]
     * @param {number} [endAngle = NUMBER.TAU]
     * @param {number} [innerRadius = 0]
     */
    #CreateVertices(startAngle = 0, endAngle = NUMBER.TAU, innerRadius = 0)
    {
        const theta = endAngle - startAngle;

        for (let offset = 0, s = 0; s <= this.#Segments; ++s)
        {
            const angle = startAngle + s * theta / this.#Segments;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            this.#VertexData[offset++] = cos * this.#Radius;
            this.#VertexData[offset++] = sin * this.#Radius;

            this.#VertexData[offset++] = cos * innerRadius;
            this.#VertexData[offset++] = sin * innerRadius;
        }
    }

    #CreateIndices()
    {
        for (let index = 0, i = 0; i < this.#Segments; i++)
        {
            const offset = i * 2;

            this.#IndexData[index++] = offset + 1; // 0 _____ 2
            this.#IndexData[index++] = offset + 3; //  |    /|
            this.#IndexData[index++] = offset + 2; //  |   / |
            this.#IndexData[index++] = offset + 2; //  |  /  |
            this.#IndexData[index++] = offset + 0; //  | /   |
            this.#IndexData[index++] = offset + 1; // 1|/____|3
        }
    }

    #CreateBuffers()
    {
        // Vertex buffer setup:
        this.#VertexBuffer = this.#Renderer.CreateBuffer(
        {
            size: this.#VertexData.byteLength,
            label: `${this.#Label} Vertex Data Buffer`,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(this.#VertexBuffer, this.#VertexData);

        // Index buffer setup:
        this.#IndexBuffer = this.#Renderer.CreateBuffer(
        {
            size: this.#IndexData.byteLength,
            label: `${this.#Label} Index Buffer`,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(this.#IndexBuffer, this.#IndexData);

        // Uniform buffer setup:
        this.#Uniform = new Float32Array(this.#Size.color + this.#Size.matrix);

        this.#UniformBuffer = this.#Renderer.CreateBuffer(
        {
            size: this.#Uniform.length * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            label: `${this.#Label} Uniform Buffer`
        });

        // Bind Group setup:
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

            this.#Center[0] = this.#Matrix[8];
            this.#Center[1] = this.#Matrix[9];

            this.#MatrixUpdate = false;
        }

        return this;
    }

    Update()
    {
        this.#UpdateMatrix();

        this.#Renderer.SetBindGroups(this.#BindGroup);
        this.#Renderer.SetIndexBuffer(this.#IndexBuffer);
        this.#Renderer.SetVertexBuffers(this.#VertexBuffer);
        this.#Renderer.WriteBuffer(this.#UniformBuffer, this.#Uniform);

        return this;
    }

    /** @param {Vec2} position */
    set Position(position)
    {
        mat3.translation(this.#Position = position, this.#Translation);
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

    /** @param {Vec2} origin */
    set Origin(origin)
    {
        this.#Pivot[0] = origin[0];      //       -1
        this.#Pivot[1] = origin[1];      //        |
                                         // -1 --- 0 --- 1
        this.#Pivot[0] *= -this.#Radius; //        |
        this.#Pivot[1] *= -this.#Radius; //        1

        mat3.translation(this.#Pivot, this.#Origin);

        this.#Pivot[0] = origin[0];
        this.#Pivot[1] = origin[1];

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

    /** @param {Vec2} scale */
    set Scale(scale)
    {
        mat3.scaling(this.#Scale = scale, this.#Scaling);
        this.#MatrixUpdate = true;
    }

    get Scale()
    {
        return this.#Scale;
    }

    /** @param {Vec4} color */
    set Color(color)
    {
        this.#Color.set(color);
        this.#MatrixUpdate = true;
    }

    get Color()
    {
        return this.#Color;
    }

    get Vertices()
    {
        return this.#Vertices;
    }
}
