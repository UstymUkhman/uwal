import { CreateConstantObject, GetParamArray } from "#/utils";
import { vec2, mat3 } from "wgpu-matrix";
import { NUMBER } from "#/Constants";

export default class LegacyShape
{
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

    /** @type {GPUBuffer} */ #IndexBuffer;
    /** @type {GPUBuffer} */ #UniformBuffer;
    /** @type {LegacyRenderer} */ #Renderer;

    /**
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     * @typedef {import("wgpu-matrix").Vec4Arg} Vec4
     */

    /** @type {GPUBuffer[]} */ #VertexBuffers = [];
    /** @type {GPUBindGroup[]} */ #BindGroups = [void 0];

    /** @type {Vec2} */ #Scale    = new Float32Array([1, 1]);
    /** @type {Vec2} */ #Pivot    = new Float32Array([0, 0]);
    /** @type {Vec2} */ #Center   = new Float32Array([0, 0]);
    /** @type {Vec2} */ #Position = new Float32Array([0, 0]);

    /** @type {{ [K in "color" | "matrix"]: number }} */ #Offset;
    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create() });

    /**
     * @typedef {Object} ShapeDescriptor
     * @property {LegacyRenderer} renderer
     * @property {number} [segments]
     * @property {number} [radius = 0]
     * @property {string} [label = "Shape"]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = NUMBER.TAU]
     * @param {ShapeDescriptor} descriptor
     */
    constructor(descriptor)
    {
        this.#Renderer = descriptor.renderer;
        this.#Segments = descriptor.segments;
        this.#Radius = descriptor.radius ?? 0;
        this.#Label = descriptor.label ?? "Shape";

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

        const vertexBuffer = this.#Renderer.CreateVertexBuffer(vertexData, {
            label: `${this.#Label} Vertex Buffer`
        });

        this.#Renderer.WriteBuffer(vertexBuffer, vertexData);
        this.#VertexBuffers.push(vertexBuffer);
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

        this.#IndexBuffer = this.#Renderer.CreateIndexBuffer(indexData, {
            label: `${this.#Label} Index Buffer`
        });

        this.#Renderer.WriteBuffer(this.#IndexBuffer, indexData);
    }

    #CreateUniformBuffer()
    {
        const { buffer, shape: { color, matrix }} = this.#Renderer.CreateUniformBuffer("shape", {
            label: `${this.#Label} Uniform Buffer`
        });

        this.#UniformBuffer = buffer;
        this.#Matrix = matrix;
        this.#Color = color;

        this.#BindGroups[0] = this.#Renderer.CreateBindGroup(
            this.#Renderer.CreateBindGroupEntries([
                { buffer: this.#Renderer.ResolutionBuffer },
                { buffer: this.#UniformBuffer }
            ]), 0, `${this.#Label} Bind Group`
        );

        this.#Offset = CreateConstantObject({
            matrix: color.length * Float32Array.BYTES_PER_ELEMENT,
            color: 0 * Float32Array.BYTES_PER_ELEMENT
        });
    }

    #UpdateMatrix()
    {
        if (this.#MatrixUpdate)
        {
            mat3.multiply(this.#Translation, this.#Rotation, this.#Matrix);
            mat3.multiply(this.#Matrix, this.#Scaling, this.#Matrix);
            mat3.multiply(this.#Matrix, this.#Origin, this.#Matrix);

            this.#Renderer.WriteBuffer(this.#UniformBuffer, this.#Matrix, this.#Offset.matrix);

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
        this.#Renderer.SetVertexBuffers(this.#VertexBuffers);
        this.#Renderer.SetIndexBuffer(this.#IndexBuffer);
        this.#Renderer.SetBindGroups(this.#BindGroups);

        return this.#UpdateMatrix();
    }

    /** @param {boolean} [submit = true] */
    Render(submit = true)
    {
        this.#Renderer.SavePipelineState();
        this.#Renderer.Render(this.Update().#Vertices, submit);
        this.#Renderer.RestorePipelineState();
    }

    /** @param {GPUBindGroup | GPUBindGroup[]} bindGroups */
    AddBindGroups(bindGroups)
    {
        this.#BindGroups.push(...GetParamArray(bindGroups));
    }

    /** @param {GPUBuffer | GPUBuffer[]} vertexBuffers */
    AddVertexBuffers(vertexBuffers)
    {
        this.#VertexBuffers.push(...GetParamArray(vertexBuffers));
    }

    /** @param {import("../Color").default | Vec4} color */
    set Color(color)
    {
        this.#Color.set(Array.isArray(color) || ArrayBuffer.isView(color) ? color : color.rgba);
        this.#Renderer.WriteBuffer(this.#UniformBuffer, this.#Color, this.#Offset.color);
    }

    get Color()
    {
        return this.#Color;
    }

    /** @param {Vec2} position */
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
        this.#Angle = rotation;
        mat3.rotation(this.#Angle, this.#Rotation);
        this.#MatrixUpdate = true;
    }

    get Rotation()
    {
        return this.#Angle;
    }

    /** @param {Vec2} scale */
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

    /** @param {Vec2} origin */
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

    Destroy()
    {
        this.#VertexBuffers.forEach(buffer => buffer.destroy());
        this.#UniformBuffer = this.#UniformBuffer.destroy();
        this.#IndexBuffer = this.#IndexBuffer.destroy();

        this.#VertexBuffers.splice(0);
        this.#BindGroups.splice(0);
    }
}
