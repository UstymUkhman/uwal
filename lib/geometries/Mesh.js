import { SetDrawParams } from "#/utils";

export default class Mesh
{
    /** @type {number} */ #Radius = 0.0;
    /** @protected @type {string} */ Label;

    /** @type {string} */ #ID = crypto.randomUUID();
    /** @type {number} */ PositionAttributeSize = 4.0;
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
        return this.DrawParams = /*@__INLINE__*/ SetDrawParams(this.DrawParams, .../** @type {DrawParams} */ (args));
    }

    /** @param {Float32Array<ArrayBufferLike>} vertices */
    #ComputeBoundingSphere(vertices)
    {
        this.#Radius = 0;

        for (
            let vertex = 0,
            squaredDistance = 0,
            length = vertices.length,
            size = this.PositionAttributeSize;
            vertex < length; vertex += size, squaredDistance = 0
        ) {
            for (let v = vertex, l = vertex + size; v < l; ++v)
                squaredDistance += vertices[v] ** 2;

            this.#Radius = Math.max(this.#Radius, squaredDistance);
        }

        this.#Radius = Math.sqrt(this.#Radius);
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

        /** @todo Add `#ComputeBoundingBox` method. */
        this.#ComputeBoundingSphere(vertexData);
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

        this.VertexBuffers[0]?.buffer.size && (this.PositionAttributeSize ||=
            this.VertexBuffers[0].buffer.size / indexData.length / Float32Array.BYTES_PER_ELEMENT
        );
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

    get Radius()
    {
        return this.#Radius;
    }

    get ID()
    {
        return this.#ID;
    }

    Destroy()
    {
        this.IndexBuffer?.buffer.destroy();
        this.IndexBuffer = undefined;
    }
}
