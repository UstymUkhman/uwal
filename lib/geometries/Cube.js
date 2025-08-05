import { ERROR, ThrowError } from "#/Errors";
import { USAGE } from "#/pipelines";

export default class Cube
{
    #UV = new Float32Array([
        // Top
        0.5 ,  0.5,
        0.75,  0.5,
        0.5 ,  1  ,
        0.75,  1  ,

        // Bottom
        0.25,  0.5,
        0.5 ,  0.5,
        0.25,  1  ,
        0.5 ,  1  ,

        // Front
        0   ,  0  ,
        0   ,  0.5,
        0.25,  0  ,
        0.25,  0.5,

        // Back
        0.5 ,  0  ,
        0.5 ,  0.5,
        0.75,  0  ,
        0.75,  0.5,

        // Left
        0   ,  0.5,
        0.25,  0.5,
        0   ,  1  ,
        0.25,  1  ,

        // Right
        0.25,  0  ,
        0.5 ,  0  ,
        0.25,  0.5,
        0.5 ,  0.5
    ]);

    /** @type {string} */ #Label;
    #Transform = new Float32Array(16);

    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBuffer} */ #TransformBuffer;

    /** @param {string} [label = "Cube"] */
    constructor(label)
    {
        this.#Label = label ?? "Cube";
    }

    /**
     * @param {Renderer} Renderer
     * @param {import("../stages/RenderStage").NewRenderPipelineDescriptor} moduleDescriptor
     */
    async CreatePipeline(Renderer, moduleDescriptor)
    {
        const pipelineName = `${this.#Label} Pipeline`;

        // Set default pipeline name if it's not explicitly set in `moduleDescriptor`:
        if (Array.isArray(moduleDescriptor) || typeof moduleDescriptor === "string")
            moduleDescriptor = { shader: moduleDescriptor, pipelineName };

        else if (moduleDescriptor instanceof GPUShaderModule)
            moduleDescriptor = { module: moduleDescriptor, pipelineName };

        else
            moduleDescriptor.pipelineName ??= pipelineName;

        this.#Pipeline = await Renderer.CreatePipeline(moduleDescriptor);

        this.#CreateTransformBuffer();
        this.#CreateVertexBuffer();
        this.#CreateIndexBuffer();

        return this.#Pipeline;
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers, offsets, sizes)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Use \`Cube.CreatePipeline\` or \`Cube.SetRenderPipeline\` method before adding vertex buffers.`
        );

        this.#Pipeline.AddVertexBuffers(vertexBuffers, offsets, sizes);
    }

    /** @param {RenderPipeline} pipeline */
    SetRenderPipeline(pipeline)
    {
        this.#Pipeline = pipeline;
        this.#CreateTransformBuffer();
        this.#CreateVertexBuffer();
        this.#CreateIndexBuffer();
    }

    #CreateTransformBuffer()
    {
        this.#TransformBuffer = this.#Pipeline.CreateBuffer(
        {
            size: this.#Transform.length * Float32Array.BYTES_PER_ELEMENT,
            label: `${this.#Label} Uniform Buffer`,
            usage: USAGE.UNIFORM
        });
    }

    #CreateVertexBuffer()
    {
        const vertexData = new Float32Array(
        [
            // Top
            -1,  1,  1,
             1,  1,  1,
            -1,  1, -1,
             1,  1, -1,

             // Bottom
             1, -1,  1,
            -1, -1,  1,
             1, -1, -1,
            -1, -1, -1,

            // Front
            -1,  1,  1,
            -1, -1,  1,
             1,  1,  1,
             1, -1,  1,

             // Back
             1,  1, -1,
             1, -1, -1,
            -1,  1, -1,
            -1, -1, -1,

            // Left
            -1,  1,  1,
            -1,  1, -1,
            -1, -1,  1,
            -1, -1, -1,

            // Right
            1,  1, -1,
            1,  1,  1,
            1, -1, -1,
            1, -1,  1
        ]);

        const vertexBuffer = this.#Pipeline.CreateVertexBuffer(vertexData, {
            label: `${this.#Label} Vertex Buffer`
        });

        this.#Pipeline.WriteBuffer(vertexBuffer, vertexData);
        this.#Pipeline.SetVertexBuffers(vertexBuffer);
    }

    #CreateIndexBuffer()
    {
        const indexData = new Uint16Array(
        [
             0,  1,  2,  2,  1,  3, // Top
             4,  5,  6,  6,  5,  7, // Bottom
             8,  9, 10, 10,  9, 11, // Front
            12, 13, 14, 14, 13, 15, // Back
            16, 17, 18, 18, 17, 19, // Left
            20, 21, 22, 22, 21, 23  // Right
        ]);

        const indexBuffer = this.#Pipeline.CreateIndexBuffer(indexData, {
            label: `${this.#Label} Index Buffer`
        });

        this.#Pipeline.WriteBuffer(indexBuffer, indexData);
        this.#Pipeline.SetIndexBuffer(indexBuffer, "uint16");
        this.#Pipeline.SetDrawParams(indexData.length);
    }

    Update()
    {
        this.#Pipeline.WriteBuffer(this.#TransformBuffer, this.#Transform);
    }

    get PositionAttribute()
    {
        return { name: "position", format: "float32x3" };
    }

    get TransformBuffer()
    {
        return this.#TransformBuffer;
    }

    get Transform()
    {
        return this.#Transform;
    }

    get Pipeline()
    {
        return this.#Pipeline;
    }

    get UV()
    {
        return this.#UV;
    }

    Destroy()
    {
        this.#Pipeline.Destroy();
        this.#TransformBuffer.destroy();
        this.#TransformBuffer = undefined;
    }
}
