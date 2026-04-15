import { CreateConstantObject, SetDrawParams, MathUtils } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";

/**
 * @typedef {Readonly<Record<
 *     "TRIANGLE" |
 *     "SQUARE"   |
 *     "PENTAGON" |
 *     "HEXAGON"  |
 *     "HEPTAGON" |
 *     "OCTAGON"  |
 *     "NONAGON"  |
 *     "DECAGON"  |
 *     "DODECAGON",
 *     number
 * >>} Segments
 * @type {Segments}
 */
const SEGMENTS = /*@__PURE__*/ CreateConstantObject(
{
    TRIANGLE:   3,
    SQUARE:     4,
    PENTAGON:   5,
    HEXAGON:    6,
    HEPTAGON:   7,
    OCTAGON:    8,
    NONAGON:    9,
    DECAGON:   10,
    DODECAGON: 12
});

let ID = 0;

export default class Shape
{
    /**
     * @typedef {Object} ShapeDescriptor
     * @property {keyof SEGMENTS | number} [segments]
     * @property {string} [label = "Shape"]
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = MathUtils.TAU]
     * @property {GPUIndexFormat} [indexFormat = "uint16"]
     */

    /** @type {number} */ #ID = 0;
    /** @type {number} */ #Radius;
    /** @type {number} */ #Segments;

    /** @type {GPUIndexFormat} */ IndexFormat;
    /** @type {ShapeDescriptor} */ #Descriptor;
    /** @type {boolean} */ #AddUVBuffer = false;

    /** @type {Uint16Array<ArrayBuffer> | undefined} */ #IndexData;
    /** @type {Float32Array<ArrayBuffer> | undefined} */ #VertexData;

    /** @type {DrawParams} */ DrawParams = [0, void 0, void 0, void 0, void 0];
    /** @import {DrawParams, VertexAttribute} from "../pipelines/RenderPipeline" */
    /** @typedef {import("../pipelines/BasePipeline").TypedArray<ArrayBuffer>} VertexData */

    /** @type {import("../pipelines/RenderPipeline").VertexBuffer[]} */ VertexBuffers = [];
    /** @type {import("../pipelines/RenderPipeline").IndexBufferParams | undefined} */ IndexBuffer;

    /** @param {ShapeDescriptor} [descriptor = { segments: "SQUARE", radius: 0 }] */
    constructor(descriptor = { segments: "SQUARE", radius: 0 })
    {
        this.#ID = ID++;
        let s = descriptor.segments;
        const c = typeof s === "number" && s;
        s = /** @type {keyof Segments} */ (s || "SQUARE");

        this.IndexFormat = descriptor.indexFormat ?? "uint16";
        this.#Descriptor = { label: "Shape", ...descriptor };
        this.#Radius = descriptor.radius || 0;
        this.#Segments = c || SEGMENTS[s];
    }

    /** @param {(number | undefined)[]} args */
    SetDrawParams(...args)
    {
        return this.DrawParams = /*@__INLINE__*/ SetDrawParams(this.DrawParams, .../** @type {DrawParams} */ (args));
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Descriptor.label]
     */
    #CreatePositionBuffer(Pipeline, label = this.#Descriptor.label)
    {
        let vertexData = this.#VertexData;

        if (!vertexData)
        {
            // Two vertices per segment and one more to wrap around:
            vertexData = new Float32Array((this.#Segments + 1) * 2 * (2 + 1));

            const { endAngle = MathUtils.TAU, startAngle = 0, innerRadius = 0 } = this.#Descriptor;
            const theta = endAngle - startAngle;

            for (let offset = 0, s = 0, l = this.#Segments; s <= l; ++s)
            {
                const angle = startAngle + s * theta / l;

                const cos = Math.cos(angle);
                const sin = Math.sin(angle);

                vertexData[offset++] = cos * this.#Radius;
                vertexData[offset++] = sin * this.#Radius;

                vertexData[offset++] = cos * innerRadius;
                vertexData[offset++] = sin * innerRadius;
            }
        }

        const vertexBuffer = Pipeline.CreateVertexBuffer(vertexData, { label: `${label} Vertex Buffer` });
        this.VertexBuffers = Pipeline.SetVertexBuffers(vertexBuffer);
        Pipeline.WriteBuffer(vertexBuffer, vertexData);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Descriptor.label]
     */
    #CreateIndexBuffer(Pipeline, label = this.#Descriptor.label)
    {
        let indexData = this.#IndexData;

        if (!indexData)
        {
            indexData = new Uint16Array(this.#Segments * 6);

            for (let index = 0, i = 0, l = this.#Segments; i < l; ++i)
            {
                const offset = i * 2;

                indexData[index++] = offset + 1; // 0 _____ 2
                indexData[index++] = offset + 3; //  |    /|
                indexData[index++] = offset + 2; //  |   / |
                indexData[index++] = offset + 2; //  |  /  |
                indexData[index++] = offset + 0; //  | /   |
                indexData[index++] = offset + 1; // 1|/____|3
            }
        }

        const indexBuffer = Pipeline.CreateIndexBuffer(indexData, { label: `${label} Index Buffer` });
        Pipeline.SetDrawParams.apply(Pipeline, this.SetDrawParams(indexData.length));
        this.IndexBuffer = Pipeline.SetIndexBuffer(indexBuffer, this.IndexFormat);
        Pipeline.WriteBuffer(indexBuffer, indexData);
    }

    /** @param {RenderPipeline} Pipeline */
    #CreateUVBuffer(Pipeline)
    {
        if (!this.#AddUVBuffer || this.#VertexData) return;

        const { endAngle = MathUtils.TAU, startAngle = 0 } = this.#Descriptor;
        const uvs = new Float32Array(this.#Segments * 8);
        const theta = endAngle - startAngle;

        for (let a = startAngle, s = 0, l = this.#Segments; s <= l; ++s, a = startAngle + s * theta / l)
            uvs.set([(Math.cos(a) + 1) * 0.5, Math.sin(a) * -0.5 + 0.5, 0.5, 0.5], s * 4);

        this.AddUVBuffer(Pipeline, uvs);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Descriptor.label]
     */
    CreateBuffers(Pipeline, label = this.#Descriptor.label)
    {
        this.#CreatePositionBuffer(Pipeline, label);
        this.#CreateIndexBuffer(Pipeline, label);
        this.#CreateUVBuffer(Pipeline);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {import("../pipelines/BasePipeline").TypedArray<ArrayBuffer>} data
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {string} [vertexEntry = "vertex"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    AddVertexBuffer(Pipeline, data, attributes, vertexEntry = "vertex", stepMode = "vertex")
    {
        !this.Vertices && ThrowError(ERROR.INDEX_BUFFER_NOT_FOUND, `\`AddVertexBuffer\` method.
            Call \`Geometry.CreateBuffers\` or \`Shape.SetRenderPipeline\` method before adding a vertex buffer.`
        );

        const { buffer, layout } = Pipeline.CreateVertexBuffer(attributes, this.Vertices, vertexEntry, stepMode);
        this.VertexBuffers = Pipeline.AddVertexBuffers(buffer);
        Pipeline.WriteBuffer(buffer, data);
        return { buffer, layout };
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexData} data
     * @param {string} [vertexEntry = "vertexUV"]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "uv"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    AddUVBuffer(Pipeline, data, vertexEntry = "vertexUV", attributes = "uv", stepMode = "vertex")
    {
        return this.AddVertexBuffer(Pipeline, data, attributes, vertexEntry, stepMode);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [vertexEntry = "vertex"]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "position"]
     */
    GetPositionBufferLayout(Pipeline, vertexEntry = "vertex", attributes = "position")
    {
        return Pipeline.CreateVertexBufferLayout(attributes, vertexEntry);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [vertexEntry = "vertexUV"]
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "uv"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     */
    GetUVBufferLayout(Pipeline, vertexEntry = "vertexUV", attributes = "uv", stepMode = "vertex")
    {
        return (this.#AddUVBuffer = true) && Pipeline.CreateVertexBufferLayout(attributes, vertexEntry, stepMode);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [vertexEntry = "vertex"]
     * @param {VertexAttribute[]} [attributes = ["instanceColumn0", "instanceColumn1", "instanceColumn2"]]
     */
    GetInstanceBufferLayout(
        Pipeline, vertexEntry = "vertex", attributes = ["instanceColumn0", "instanceColumn1", "instanceColumn2"]
    ) {
        return Pipeline.CreateVertexBufferLayout(attributes, vertexEntry, "instance");
    }

    /** @param {Float32Array<ArrayBuffer>} data */
    set VertexData(data)
    {
        this.#VertexData = data;
    }

    /** @param {Uint16Array<ArrayBuffer>} data */
    set IndexData(data)
    {
        this.#IndexData = data;
    }

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
        this.#VertexData = undefined;
        this.#IndexData = undefined;
    }
}
