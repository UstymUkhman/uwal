import { SetDrawParams } from "#/utils";

export default class Mesh
{
    /** @protected @type {string} */ Label;
    /** @type {string} */ #ID = crypto.randomUUID();
    /** @type {GPUIndexFormat | undefined} */ IndexFormat;

    /** @typedef {import("../pipelines/RenderPipeline").DrawParams} DrawParams */
    /** @type {DrawParams} */ DrawParams = [0, void 0, void 0, void 0, void 0];

    /** @type {import("../pipelines/RenderPipeline").VertexBuffer[]} */ VertexBuffers = [];
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

    /** @param {(number | undefined)[]} args */
    SetDrawParams(...args)
    {
        return SetDrawParams(/** @type {DrawParams} */ (this.DrawParams), .../** @type {DrawParams} */ (args));
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Float32Array<ArrayBufferLike>} vertexData
     * @param {string} [label = this.Label]
     */
    CreateVertexBuffer(Pipeline, vertexData, label = this.Label)
    {
        const vertexBuffer = Pipeline.CreateVertexBuffer(vertexData, { label: `${label} Vertex Buffer` });
        Pipeline.WriteBuffer(vertexBuffer, /** @type {Float32Array<ArrayBuffer>} */ (vertexData));
        this.VertexBuffers = Pipeline.SetVertexBuffers(vertexBuffer);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Uint16Array<ArrayBufferLike>} indexData
     * @param {string} [label = this.Label]
     */
    CreateIndexBuffer(Pipeline, indexData, label = this.Label)
    {
        const indexBuffer = Pipeline.CreateIndexBuffer(indexData, { label: `${label} Index Buffer` });
        Pipeline.WriteBuffer(indexBuffer, /** @type {Uint16Array<ArrayBuffer>} */ (indexData));
        Pipeline.SetDrawParams.apply(Pipeline, this.SetDrawParams(indexData.length));
        this.IndexBuffer = Pipeline.SetIndexBuffer(indexBuffer, this.IndexFormat);
    }

    /**
     * @abstract
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.Label]
     */
    CreateBuffers(Pipeline, label = this.Label)
    {}

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
        }
    }
}
