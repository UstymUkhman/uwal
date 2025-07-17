import { GetParamArray } from "#/utils";

export default class LegacyCube
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
    /** @type {number} */ #Vertices;

    /** @type {GPUBuffer} */ #IndexBuffer;
    /** @type {LegacyRenderer} */ #Renderer;

    /** @type {GPUBuffer} */ #TransformBuffer;
    /** @type {GPUBuffer[]} */ #VertexBuffers = [];

    #Transform = new Float32Array(16);

    /**
     * @param {LegacyRenderer} renderer
     * @param {string} [label = "Cube"]
     */
    constructor(renderer, label)
    {
        this.#Renderer = renderer;
        this.#Label = label ?? "Cube";

        this.#CreateIndexBuffer();
        this.#CreateVertexBuffer();
        this.#CreateTransformBuffer();
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

        this.#IndexBuffer = this.#Renderer.CreateIndexBuffer(indexData, {
            label: `${this.#Label} Index Buffer`
        });

        this.#Renderer.WriteBuffer(this.#IndexBuffer, indexData);

        /** @todo Remove next line in version `0.1.0`. */
        this.#Renderer.SetIndexBuffer(this.#IndexBuffer, "uint16");

        this.#Vertices = indexData.length;
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

        const vertexBuffer = this.#Renderer.CreateVertexBuffer(vertexData, {
            label: `${this.#Label} Vertex Buffer`
        });

        this.#Renderer.WriteBuffer(vertexBuffer, vertexData);

        /** @todo Remove next line in version `0.1.0`. */
        this.#Renderer.SetVertexBuffers(vertexBuffer);

        this.#VertexBuffers.push(vertexBuffer);
    }

    #CreateTransformBuffer()
    {
        this.#TransformBuffer = this.#Renderer.CreateBuffer(
        {
            size: this.#Transform.length * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            label: `${this.#Label} Uniform Buffer`
        });
    }

    /** @param {GPUBuffer | GPUBuffer[]} vertexBuffers */
    AddVertexBuffers(vertexBuffers)
    {
        this.#VertexBuffers.push(...GetParamArray(vertexBuffers));
    }

    /** @deprecated Use `LegacyCube.Update` instead. */
    UpdateTransformBuffer()
    {
        this.#Renderer.WriteBuffer(this.#TransformBuffer, this.#Transform);
    }

    /** @param {boolean} [submit = true] */
    Render(submit = true)
    {
        this.#Renderer.SavePipelineState();
        this.#Renderer.Render(this.Update(), submit);
        this.#Renderer.RestorePipelineState();
    }

    Update()
    {
        this.#Renderer.WriteBuffer(this.#TransformBuffer, this.#Transform);
        this.#Renderer.SetIndexBuffer(this.#IndexBuffer, "uint16");
        this.#Renderer.SetVertexBuffers(this.#VertexBuffers);

        return this.#Vertices;
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

    get Vertices()
    {
        return this.#Vertices;
    }

    get UV()
    {
        return this.#UV;
    }

    Destroy()
    {
        this.#TransformBuffer = this.#TransformBuffer.destroy();
        this.#VertexBuffers.forEach(buffer => buffer.destroy());
        this.#IndexBuffer = this.#IndexBuffer.destroy();
        this.#VertexBuffers.splice(0);
    }
}
