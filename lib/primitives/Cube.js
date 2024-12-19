export default class Cube
{
    /** @type {string} */ #Label;
    /** @type {number} */ #Vertices;
    /** @type {Renderer} */ #Renderer;

    /** @type {GPUBuffer} */ #IndexBuffer;
    /** @type {GPUBuffer} */ #VertexBuffer;
    /** @type {GPUBuffer} */ #TransformBuffer;

    #Transform = new Float32Array(16);

    /**
     * @param {Renderer} renderer
     * @param {string} [label = "Cube"]
     */
    constructor(renderer, label)
    {
        this.#Label = label ?? "Cube";
        this.#Renderer = renderer;

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

        this.#VertexBuffer = this.#Renderer.CreateVertexBuffer(vertexData, {
            label: `${this.#Label} Vertex Buffer`
        });

        this.#Renderer.WriteBuffer(this.#VertexBuffer, vertexData);
        this.#Renderer.SetVertexBuffers(this.#VertexBuffer);
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

    UpdateTransformBuffer()
    {
        this.#Renderer.WriteBuffer(this.#TransformBuffer, this.#Transform);
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

    Destroy()
    {
        this.#IndexBuffer = this.#IndexBuffer.destroy();
        this.#VertexBuffer = this.#VertexBuffer.destroy();
        this.#TransformBuffer = this.#TransformBuffer.destroy();
    }
}
