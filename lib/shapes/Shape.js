import { CreateConstantObject } from "@/Utils";
import { SEGMENTS } from "@/shapes/Constants";
import { ERROR, ThrowError } from "@/Errors";
import { NUMBER } from "@/Constants";

export default class Shape
{
    /** @type {number} */ #Segments;
    /** @type {number} */ #Vertices;

    /** @type {Uint32Array} */ #IndexData;
    /** @type {Float32Array} */ #VertexData;
    /** @type {GPUBuffer} */ #VertexInfoBuffer;
    /** @type {Float32Array} */ #VertexInfoData;

    /** @type {import("../pipelines").RenderPipeline} */ #Renderer;
    #Offset = CreateConstantObject({ position: 0, scale: 2, color: 4 });

    /**
     * @param {import("../pipelines").RenderPipeline} renderer
     * @param {number} [segments = SEGMENTS.CUSTOM]
     * @param {number} [outerRadius = 1]
     * @param {number} [innerRadius = 0]
     * @param {number} [startAngle = 0]
     * @param {number} [endAngle = NUMBER.TAU]
     */
    constructor(
        renderer,
        segments = SEGMENTS.CUSTOM,
        outerRadius = 1,
        innerRadius = 0,
        startAngle = 0,
        endAngle = NUMBER.TAU
    )
    {
        if (typeof segments !== "number") ThrowError(ERROR.REQUIRED_SEGMENTS);

        this.#Renderer = renderer;
        this.#Segments = segments;

        // Two vertices per segment and one more to wrap around:
        this.#VertexData = new Float32Array((segments + 1) * 2 * (2 + 1));
        this.#IndexData = new Uint32Array(this.#Vertices = segments * 6);

        this.#CreateVertices(startAngle, endAngle, innerRadius, outerRadius);

        this.#CreateIndices();
        this.#CreateBuffers();
    }

    /**
     * @param {number} startAngle
     * @param {number} endAngle
     * @param {number} innerRadius
     * @param {number} outerRadius
     */
    #CreateVertices(startAngle, endAngle, innerRadius, outerRadius)
    {
        const theta = endAngle - startAngle;

        for (let offset = 0, s = 0; s <= this.#Segments; ++s)
        {
            const angle = startAngle + s * theta / this.#Segments;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            this.#VertexData[offset++] = cos * outerRadius;
            this.#VertexData[offset++] = sin * outerRadius;

            this.#VertexData[offset++] = cos * innerRadius;
            this.#VertexData[offset++] = sin * innerRadius;
        }
    }

    #CreateIndices()
    {
        for (let index = 0, i = 0; i < this.#Segments; i++)
        {
            const offset = i * 2;

            this.#IndexData[index++] = offset + 1; // 0 _____ 2
            this.#IndexData[index++] = offset + 3; //  |    /|
            this.#IndexData[index++] = offset + 2; //  |   / |
            this.#IndexData[index++] = offset + 2; //  |  /  |
            this.#IndexData[index++] = offset + 0; //  | /   |
            this.#IndexData[index++] = offset + 1; // 1|/____|3
        }
    }

    #CreateBuffers()
    {
        // Vertex data buffer setup:
        const vertexDataBuffer = this.#Renderer.CreateBuffer({
            label: "Shape Vertex Data Buffer",
            size: this.#VertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(vertexDataBuffer, this.#VertexData);

        // Vertex info buffer setup:
        const vertexInfoBufferSize =
            2 * Float32Array.BYTES_PER_ELEMENT + // Position - 2 32bit floats
            2 * Float32Array.BYTES_PER_ELEMENT + // Scale    - 2 32bit floats
            4 * Float32Array.BYTES_PER_ELEMENT;  // Color    - 4 32bit floats

        this.#VertexInfoData = new Float32Array(vertexInfoBufferSize / Float32Array.BYTES_PER_ELEMENT);

        this.#VertexInfoBuffer = this.#Renderer.CreateBuffer({
            label: "Shape Vertex Info Buffer",
            size: vertexInfoBufferSize,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.SetVertexBuffers([vertexDataBuffer, this.#VertexInfoBuffer]);

        // Vertex indices buffer setup:
        const indexBuffer = this.#Renderer.CreateBuffer({
            label: "Shape Index Buffer",
            size: this.#IndexData.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(indexBuffer, this.#IndexData);
        this.#Renderer.SetIndexBuffer(indexBuffer);
    }

    Update()
    {
        this.#Renderer.WriteBuffer(this.#VertexInfoBuffer, this.#VertexInfoData);

        return this;
    }

    /** @param {import("wgpu-matrix").Vec2} position */
    set Position(position)
    {
        this.#VertexInfoData.set(position, this.#Offset.position);
    }

    /** @param {import("wgpu-matrix").Vec2} scale */
    set Scale(scale)
    {
        this.#VertexInfoData.set(scale, this.#Offset.scale);
    }

    /** @param {import("wgpu-matrix").Vec4} color */
    set Color(color)
    {
        this.#VertexInfoData.set(color, this.#Offset.color);
    }

    get Vertices()
    {
        return this.#Vertices;
    }
}
