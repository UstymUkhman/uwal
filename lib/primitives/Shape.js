import { CreateConstantObject, MathUtils } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { vec2, mat3 } from "wgpu-matrix";

export default class Shape
{
    /**
     * @typedef {Object} ShapeRendererDescriptor
     * @property {Renderer} renderer
     * @property {number} [segments = 4]
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = MathUtils.TAU]
     *
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     * @typedef {import("wgpu-matrix").Vec4Arg} Vec4
     *
     * @typedef {Omit<ShapeRendererDescriptor, "renderer">} ShapeDescriptor
     */

    #Origin = mat3.create();
    #Scaling = mat3.create();
    #Rotation = mat3.create();
    #Translation = mat3.create();

    /** @type {string} */ #Label;
    /** @type {number} */ #Vertices;
    /** @type {number} */ #Angle = 0;
    /** @type {number} */ #Radius = 0;
    /** @type {Float32Array} */ #Color;
    /** @type {Float32Array} */ #Matrix;

    /** @type {GPUBuffer} */ #IndexBuffer;
    /** @type {GPUBuffer} */ #VertexBuffer;
    /** @type {GPUBuffer} */ #UniformBuffer;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {boolean} */ #MatrixUpdate = !1;
    /** @type {GPUBuffer} */ #ResolutionBuffer;

    /** @type {Vec2} */ #Scale    = vec2.set(1, 1);
    /** @type {Vec2} */ #Pivot    = vec2.set(0, 0);
    /** @type {Vec2} */ #Center   = vec2.set(0, 0);
    /** @type {Vec2} */ #Position = vec2.set(0, 0);

    /** @type {{ [K in "color" | "matrix"]: number }} */ #Offset;
    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create() });

    /** @param {string} [label = "Shape"] */
    constructor(label)
    {
        this.Scale = this.#Scale;
        this.Origin = this.#Pivot;
        this.Rotation = this.#Angle;
        this.Position = this.#Position;
        this.#Label = label ?? "Shape";
    }

    /**
     * @param {Renderer | ShapeRendererDescriptor} rendererDescriptor
     * @param {import("../stages/RenderStage").NewRenderPipelineDescriptor} moduleDescriptor
     */
    async CreatePipeline(rendererDescriptor, moduleDescriptor)
    {
        const { segments = 4, radius = 0 } = rendererDescriptor;
        const pipelineName = `${this.#Label} Pipeline`;
        this.#Radius = radius; this.Origin = this.#Pivot;

        // Set default pipeline name if it's not explicitly set in `moduleDescriptor`:
        if (Array.isArray(moduleDescriptor) || typeof moduleDescriptor === "string")
            moduleDescriptor = { shader: moduleDescriptor, pipelineName };

        else if (moduleDescriptor instanceof GPUShaderModule)
            moduleDescriptor = { module: moduleDescriptor, pipelineName };

        else
            moduleDescriptor.pipelineName ??= pipelineName;

        const Renderer = rendererDescriptor.renderer ?? rendererDescriptor;
        this.#Pipeline = await Renderer.CreatePipeline(moduleDescriptor);

        this.#CreateVertexBuffer(rendererDescriptor, segments);
        this.#CreateIndexBuffer(segments);
        this.#CreateUniformBuffer(Renderer);

        return this.#Pipeline;
    }

    /**
     * @param {Renderer} renderer
     * @param {RenderPipeline} pipeline
     * @param {ShapeDescriptor} [descriptor = {}]
     */
    SetRenderPipeline(renderer, pipeline, descriptor = {})
    {
        this.#Pipeline = pipeline;
        const { segments = 4, radius = 0 } = descriptor;
        this.#Radius = radius; this.Origin = this.#Pivot;

        this.#CreateVertexBuffer(descriptor, segments);
        this.#CreateIndexBuffer(segments);
        this.#CreateUniformBuffer(renderer);
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers, offsets, sizes)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Use \`Shape.CreatePipeline\` or \`Shape.SetRenderPipeline\` method before adding vertex buffers.`
        );

        this.#Pipeline.AddVertexBuffers(vertexBuffers, offsets, sizes);
    }

    /**
     * @param {ShapeDescriptor} descriptor
     * @param {number} segments
     */
    #CreateVertexBuffer(descriptor, segments)
    {
        // Two vertices per segment and one more to wrap around:
        const vertexData = new Float32Array((segments + 1) * 2 * (2 + 1));

        const { endAngle = MathUtils.TAU, startAngle = 0, radius = 0, innerRadius = 0 } = descriptor;
        const theta = endAngle - startAngle;
        this.#Radius = radius;

        for (let offset = 0, s = 0; s <= segments; ++s)
        {
            const angle = startAngle + s * theta / segments;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            vertexData[offset++] = cos * this.#Radius;
            vertexData[offset++] = sin * this.#Radius;

            vertexData[offset++] = cos * innerRadius;
            vertexData[offset++] = sin * innerRadius;
        }

        this.#VertexBuffer = this.#Pipeline.CreateVertexBuffer(vertexData, {
            label: `${this.#Label} Vertex Buffer`
        });

        this.#Pipeline.WriteBuffer(this.#VertexBuffer, vertexData);
        this.#Pipeline.SetVertexBuffers(this.#VertexBuffer);
    }

    /** @param {number} segments */
    #CreateIndexBuffer(segments)
    {
        const indexData = new Uint16Array(segments * 6);

        for (let index = 0, i = 0; i < segments; ++i)
        {
            const offset = i * 2;

            indexData[index++] = offset + 1; // 0 _____ 2
            indexData[index++] = offset + 3; //  |    /|
            indexData[index++] = offset + 2; //  |   / |
            indexData[index++] = offset + 2; //  |  /  |
            indexData[index++] = offset + 0; //  | /   |
            indexData[index++] = offset + 1; // 1|/____|3
        }

        this.#IndexBuffer = this.#Pipeline.CreateIndexBuffer(indexData, {
            label: `${this.#Label} Index Buffer`
        });

        this.#Pipeline.SetDrawParams(this.#Vertices = indexData.length);
        this.#Pipeline.WriteBuffer(this.#IndexBuffer, indexData);
        this.#Pipeline.SetIndexBuffer(...this.IndexBuffer);
    }

    /** @param {Renderer} Renderer */
    #CreateUniformBuffer(Renderer)
    {
        const { buffer, shape: { color, matrix }} = this.#Pipeline.CreateUniformBuffer("shape", {
            label: `${this.#Label} Uniform Buffer`
        });

        this.#ResolutionBuffer = Renderer.ResolutionBuffer;
        this.#UniformBuffer = buffer;
        this.#Matrix = matrix;
        this.#Color = color;

        this.#Pipeline.SetBindGroupsFromResources(this.BindGroupResources, 0, 0, `${this.#Label} Bind Group`);

        this.#Offset = CreateConstantObject({
            matrix: color.length * Float32Array.BYTES_PER_ELEMENT,
            color: 0 * Float32Array.BYTES_PER_ELEMENT
        });
    }

    Update()
    {
        if (this.#MatrixUpdate)
        {
            mat3.multiply(this.#Translation, this.#Rotation, this.#Matrix);
            mat3.multiply(this.#Matrix, this.#Scaling, this.#Matrix);
            mat3.multiply(this.#Matrix, this.#Origin, this.#Matrix);

            this.#Pipeline.WriteBuffer(this.#UniformBuffer, this.#Matrix, this.#Offset.matrix);

            const x = this.#Center[0] = this.#Matrix[8];
            const y = this.#Center[1] = this.#Matrix[9];

            this.#BBox.min[0] = x - this.#Radius;
            this.#BBox.min[1] = y - this.#Radius;

            this.#BBox.max[0] = x + this.#Radius;
            this.#BBox.max[1] = y + this.#Radius;

            this.#MatrixUpdate = false;
        }
    }

    /** @param {import("../Color").default | Vec4} color */
    set Color(color)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Use \`Shape.CreatePipeline\` or \`Shape.SetRenderPipeline\` method before setting the color.`
        );

        this.#Color.set((Array.isArray(color) || ArrayBuffer.isView(color)) && color || color.rgba);
        this.#Pipeline.WriteBuffer(this.#UniformBuffer, this.#Color, this.#Offset.color);
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
        this.Update();
        return this.#Center;
    }

    get Transform()
    {
        this.Update();
        return this.#Matrix;
    }

    get BoundingBox()
    {
        this.Update();
        return this.#BBox;
    }

    get BindGroupResources()
    {
        return [this.#ResolutionBuffer, this.#UniformBuffer];
    }

    get VertexBuffer()
    {
        return this.#VertexBuffer;
    }

    get IndexBuffer()
    {
        return [this.#IndexBuffer, "uint16"];
    }

    get Vertices()
    {
        return this.#Vertices;
    }

    Destroy()
    {
        this.#Pipeline.Destroy();
        this.#UniformBuffer.destroy();
        this.#UniformBuffer = undefined;
    }
}
