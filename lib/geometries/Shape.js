import { CreateConstantObject, MathUtils } from "#/utils";

/**
 * @typedef {Readonly<Record<
       "TRIANGLE" |
       "SQUARE" |
       "PENTAGON" |
       "HEXAGON" |
       "HEPTAGON" |
       "OCTAGON" |
       "NONAGON" |
       "DECAGON" |
       "DODECAGON",
       number
   >>} Segments
 * @type {Segments}
 */
const SEGMENTS = /*#__PURE__*/ CreateConstantObject(
{
    TRIANGLE: 3,
    SQUARE: 4,
    PENTAGON: 5,
    HEXAGON: 6,
    HEPTAGON: 7,
    OCTAGON: 8,
    NONAGON: 9,
    DECAGON: 10,
    DODECAGON: 12
});

export default class Shape
{
    /**
     * @typedef {Object} ShapeDescriptor
     * @property {keyof SEGMENTS | number} [segments]
     * @property {number} [label = "Shape"]
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = MathUtils.TAU]
     * @property {GPUIndexFormat} [indexFormat = "uint16"]
     */

    /** @type {number} */ #Radius;
    /** @type {number} */ #Vertices;
    /** @type {number} */ #Segments;

    /** @type {GPUIndexFormat} */ IndexFormat;
    /** @type {ShapeDescriptor} */ #Descriptor;
    /** @type {string} */ #ID = crypto.randomUUID();

    /** @type {Uint16Array<ArrayBuffer> | undefined} */ #IndexData;
    /** @type {Float32Array<ArrayBuffer> | undefined} */ #VertexData;

    /** @typedef {import("../pipelines/RenderPipeline").VertexAttribute} VertexAttribute */
    /** @type {import("../pipelines/RenderPipeline").VertexBuffer[] | undefined} */ VertexBuffers;
    /** @type {import("../pipelines/RenderPipeline").IndexBufferParams | undefined} */ IndexBuffer;

    /** @param {ShapeDescriptor} [descriptor = { segments: "SQUARE", radius: 0 }] */
    constructor(descriptor = { segments: "SQUARE", radius: 0 })
    {
        const s = descriptor.segments;
        const c = typeof s === "number" && s;
        this.#Radius = descriptor.radius ?? 0;
        this.#Segments = c || SEGMENTS[s || "SQUARE"];
        this.#Descriptor = { label: "Shape", ...descriptor };
        this.IndexFormat = descriptor.indexFormat ?? "uint16";
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "position"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    GetPositionBufferLayout(Pipeline, attributes = "position", stepMode = "vertex", vertexEntry = "vertex")
    {
        return Pipeline.CreateVertexBufferLayout(attributes, stepMode, vertexEntry);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Descriptor.label]
     */
    #CreateVertexBuffer(Pipeline, label = this.#Descriptor.label)
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
        this.IndexBuffer = Pipeline.SetIndexBuffer(indexBuffer, this.IndexFormat);
        Pipeline.SetDrawParams(this.#Vertices = indexData.length);
        Pipeline.WriteBuffer(indexBuffer, indexData);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Descriptor.label]
     */
    CreateBuffers(Pipeline, label = this.#Descriptor.label)
    {
        this.#CreateVertexBuffer(Pipeline, label);
        this.#CreateIndexBuffer(Pipeline, label);
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
        return this.#Vertices;
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

        if (this.VertexBuffers)
        {
            this.VertexBuffers[0]?.buffer.destroy();
            this.VertexBuffers.splice(0);
            this.VertexBuffers = undefined;
        }
    }
}
