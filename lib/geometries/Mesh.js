export default class Mesh
{
    /** @protected @type {string} */ Label;
    /** @type {GPUIndexFormat} */ IndexFormat

    /** @type {GPUBuffer | undefined} */ #IndexBuffer;
    /** @type {GPUBuffer | undefined} */ #VertexBuffer;

    /**
     * @param {string} [label = "Mesh"]
     * @param {GPUIndexFormat} [format]
     */
    constructor(label = "Mesh", format)
    {
        this.IndexFormat = format;
        this.Label = label;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Float32Array} vertexData
     * @param {string} [label = this.Label]
     */
    CreateVertexBuffer(Pipeline, vertexData, label = this.Label)
    {
        this.#VertexBuffer = Pipeline.CreateVertexBuffer(vertexData, {
            label: `${label} Vertex Buffer`
        });

        Pipeline.WriteBuffer(this.#VertexBuffer, vertexData);
        Pipeline.SetVertexBuffers(this.#VertexBuffer);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Uint16Array} indexData
     * @param {string} [label = this.Label]
     */
    CreateIndexBuffer(Pipeline, indexData, label = this.Label)
    {
        this.#IndexBuffer = Pipeline.CreateIndexBuffer(indexData, {
            label: `${label} Index Buffer`
        });

        Pipeline.SetIndexBuffer(this.#IndexBuffer, this.IndexFormat);
        Pipeline.WriteBuffer(this.#IndexBuffer, indexData);
        Pipeline.SetDrawParams(indexData.length);
    }

    get VertexBuffer()
    {
        return this.#VertexBuffer;
    }

    Destroy()
    {
        this.#IndexBuffer?.destroy();
        this.#VertexBuffer?.destroy();
    }
}
