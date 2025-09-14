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
     * @property {number} [radius = 0]
     * @property {number} [innerRadius = 0]
     * @property {number} [startAngle = 0]
     * @property {number} [endAngle = MathUtils.TAU]
     */

    /** @type {number} */ #Radius;
    /** @type {number} */ #Vertices;
    /** @type {number} */ #Segments;

    /** @type {ShapeDescriptor} */ #Descriptor;
    /** @type {GPUBuffer | undefined} */ #IndexBuffer;
    /** @type {GPUBuffer | undefined} */ #VertexBuffer;

    /** @type {Uint16Array<ArrayBuffer> | undefined} */ #IndexData;
    /** @type {Float32Array<ArrayBuffer> | undefined} */ #VertexData;

    /** @param {ShapeDescriptor} [descriptor = { segments: "SQUARE", radius: 0 }] */
    constructor(descriptor = { segments: "SQUARE", radius: 0 })
    {
        const s = descriptor.segments;
        const c = typeof s === "number" && s;
        this.#Segments = c || SEGMENTS[s || "SQUARE"];
        this.#Radius = descriptor.radius ?? 0;
        this.#Descriptor = descriptor;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = "Shape"]
     */
    #CreateVertexBuffer(Pipeline, label = "Shape")
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

            this.#VertexBuffer = Pipeline.CreateVertexBuffer(vertexData, {
                label: `${label} Vertex Buffer`
            });

            Pipeline.WriteBuffer(this.#VertexBuffer, vertexData);
            Pipeline.SetVertexBuffers(this.#VertexBuffer);
        }
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = "Shape"]
     */
    #CreateIndexBuffer(Pipeline, label = "Shape")
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

        this.#IndexBuffer = Pipeline.CreateIndexBuffer(indexData, {
            label: `${label} Index Buffer`
        });

        Pipeline.SetDrawParams(this.#Vertices = indexData.length);
        Pipeline.WriteBuffer(this.#IndexBuffer, indexData);
        Pipeline.SetIndexBuffer(...this.IndexBuffer);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = "Shape"]
     */
    CreateBuffers(Pipeline, label = "Shape")
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

    get Radius()
    {
        return this.#Radius;
    }

    Destroy()
    {
        this.#VertexData = this.#IndexData = undefined;
        this.#IndexBuffer = this.#IndexBuffer.destroy();
        this.#VertexBuffer = this.#VertexBuffer.destroy();
    }
}
