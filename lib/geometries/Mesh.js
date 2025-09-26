export default class Mesh
{
    /** @type {number} */ #Vertices;
    /** @protected @type {string} */ Label;
    /** @type {GPUIndexFormat} */ IndexFormat;

    /** @type {import("../pipelines/RenderPipeline").VertexBuffer[] | undefined} */ VertexBuffers;
    /** @type {import("../pipelines/RenderPipeline").IndexBufferParams | undefined} */ IndexBuffer;

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
        const vertexBuffer = Pipeline.CreateVertexBuffer(vertexData, { label: `${label} Vertex Buffer` });
        this.VertexBuffers = Pipeline.SetVertexBuffers(vertexBuffer);
        Pipeline.WriteBuffer(vertexBuffer, vertexData);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Uint16Array} indexData
     * @param {string} [label = this.Label]
     */
    CreateIndexBuffer(Pipeline, indexData, label = this.Label)
    {
        const indexBuffer = Pipeline.CreateIndexBuffer(indexData, { label: `${label} Index Buffer` });
        this.IndexBuffer = Pipeline.SetIndexBuffer(indexBuffer, this.IndexFormat);
        Pipeline.SetDrawParams(this.#Vertices = indexData.length);
        Pipeline.WriteBuffer(indexBuffer, indexData);
    }

    get Vertices()
    {
        return this.#Vertices;
    }

    Destroy()
    {
        this.IndexBuffer?.buffer.destroy();
        this.VertexBuffers?.[0].buffer.destroy();
    }
}
