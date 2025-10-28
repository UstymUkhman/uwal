import { SetDrawParams } from "#/utils";

export default class Mesh
{
    /** @protected @type {string} */ Label;
    /** @type {number[]} */ DrawParams = [];
    /** @type {GPUIndexFormat} */ IndexFormat;
    /** @type {string} */ #ID = crypto.randomUUID();

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
     * @param {GPUSize32} count
     * @param {GPUSize32} [instanceCount]
     * @param {GPUSize32} [first]
     * @param {GPUSize32} [firstInstance]
     * @param {GPUSignedOffset32} [baseVertex]
     */
    SetDrawParams(count, instanceCount, first, firstInstance, baseVertex)
    {
        return SetDrawParams(this.DrawParams, ...arguments);
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
        Pipeline.SetDrawParams.apply(Pipeline, this.SetDrawParams(indexData.length));
        this.IndexBuffer = Pipeline.SetIndexBuffer(indexBuffer, this.IndexFormat);
        Pipeline.WriteBuffer(indexBuffer, indexData);
    }

    get Vertices()
    {
        return this.DrawParams[0];
    }

    get ID()
    {
        return this.#ID;
    }

    Destroy()
    {
        this.IndexBuffer?.buffer.destroy();
        this.IndexBuffer = undefined;

        if (this.VertexBuffers)
        {
            this.VertexBuffers[0]?.buffer.destroy();
            this.VertexBuffers.splice(0);
            this.VertexBuffers = undefined;
        }
    }
}
