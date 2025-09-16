export default class Cube
{
    /** @type {string} */ #Label;
    /** @type {number} */ #Vertices;

    /** @type {GPUBuffer | undefined} */ #IndexBuffer;
    /** @type {GPUBuffer | undefined} */ #VertexBuffer;

    /** @type {Uint16Array<ArrayBuffer> | undefined} */ #IndexData;
    /** @type {Float32Array<ArrayBuffer> | undefined} */ #VertexData;

    /** @param {string} [label = "Cube"] */
    constructor(label = "Cube")
    {
        this.#Label = label;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Label]
     */
    #CreateVertexBuffer(Pipeline, label = this.#Label)
    {
        let vertexData = this.#VertexData;

        if (!vertexData)
        {
            vertexData = new Float32Array(
            [
                // Top
                -0.5,  0.5,  0.5,
                0.5,  0.5,  0.5,
                -0.5,  0.5, -0.5,
                0.5,  0.5, -0.5,

                // Bottom
                0.5, -0.5,  0.5,
                -0.5, -0.5,  0.5,
                0.5, -0.5, -0.5,
                -0.5, -0.5, -0.5,

                // Front
                -0.5,  0.5,  0.5,
                -0.5, -0.5,  0.5,
                0.5,  0.5,  0.5,
                0.5, -0.5,  0.5,

                // Back
                0.5,  0.5, -0.5,
                0.5, -0.5, -0.5,
                -0.5,  0.5, -0.5,
                -0.5, -0.5, -0.5,

                // Left
                -0.5,  0.5,  0.5,
                -0.5,  0.5, -0.5,
                -0.5, -0.5,  0.5,
                -0.5, -0.5, -0.5,

                // Right
                0.5,   0.5, -0.5,
                0.5,   0.5,  0.5,
                0.5,  -0.5, -0.5,
                0.5,  -0.5,  0.5
            ]);
        }

        this.#VertexBuffer = Pipeline.CreateVertexBuffer(vertexData, {
            label: `${label} Vertex Buffer`
        });

        Pipeline.WriteBuffer(this.#VertexBuffer, vertexData);
        Pipeline.SetVertexBuffers(this.#VertexBuffer);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Label]
     */
    #CreateIndexBuffer(Pipeline, label = this.#Label)
    {
        let indexData = this.#IndexData;

        if (!indexData)
        {
            indexData = new Uint16Array(
            [
                 0,  1,  2,  2,  1,  3, // Top
                 4,  5,  6,  6,  5,  7, // Bottom
                 8,  9, 10, 10,  9, 11, // Front
                12, 13, 14, 14, 13, 15, // Back
                16, 17, 18, 18, 17, 19, // Left
                20, 21, 22, 22, 21, 23  // Right
            ]);
        }

        this.#IndexBuffer = Pipeline.CreateIndexBuffer(indexData, {
            label: `${label} Index Buffer`
        });

        Pipeline.SetDrawParams(this.#Vertices = indexData.length);
        Pipeline.SetIndexBuffer(this.#IndexBuffer, "uint16");
        Pipeline.WriteBuffer(this.#IndexBuffer, indexData);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Label]
     */
    CreateBuffers(Pipeline, label = this.#Label)
    {
        this.#CreateVertexBuffer(Pipeline, label);
        this.#CreateIndexBuffer(Pipeline, label);
    }

    /** @param {Float32Array<ArrayBuffer>} data */
    set VertexData(data)
    {
        this.#VertexData = data;
    }

    get VertexBuffer()
    {
        return this.#VertexBuffer;
    }

    /** @param {Uint16Array<ArrayBuffer>} data */
    set IndexData(data)
    {
        this.#IndexData = data;
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
        this.#IndexData = undefined;
        this.#IndexBuffer?.destroy();
        this.#VertexData = undefined;
        this.#VertexBuffer?.destroy();
    }
}
