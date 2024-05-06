import { CreateConstantObject } from "@/Utils";
import { SEGMENTS } from "@/shapes/Constants";
import { ERROR, ThrowError } from "@/Errors";
import { NUMBER } from "@/Constants";

export default class Shape
{
    /** @type {number} */ #Segments;
    /** @type {number} */ #Vertices;

    /** @type {GPUBuffer} */ #StorageBuffer;
    /** @type {Float32Array} */ #VertexData;
    /** @type {Float32Array} */ #StorageData;

    /** @type {GPUBindGroup} */ #StorageBindGroup;
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

        // 2 triangles per segment, 3 vertices per triangle and 2 values per vertex:
        this.#VertexData = new Float32Array((this.#Vertices = segments * 3 * 2) * 2);
        this.#CreateVertices(startAngle, endAngle - startAngle, innerRadius, outerRadius);

        this.#CreateBuffers();
        this.#UpdateStorageBuffer();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} v
     */
    #AddVertexData(x, y, v)
    {
        this.#VertexData[v + 0] = x;
        this.#VertexData[v + 1] = y;
    }

    /**
     * @param {number} angle
     * @param {number} theta
     * @param {number} innerRadius
     * @param {number} outerRadius
     */
    #CreateVertices(angle, theta, innerRadius, outerRadius)
    {
        for (let vertex = 0, s = 0; s < this.#Segments; vertex += 2, ++s)
        {
            const startAngle = angle + (s + 0) * theta / this.#Segments;
            const endAngle   = angle + (s + 1) * theta / this.#Segments;

            const cosStartAngle = Math.cos(startAngle);
            const sinStartAngle = Math.sin(startAngle);
            const cosEndAngle   = Math.cos(endAngle);
            const sinEndAngle   = Math.sin(endAngle);

            this.#AddVertexData(cosStartAngle * innerRadius, sinStartAngle * innerRadius, vertex += 0); //    4 _____ 2, 3
            this.#AddVertexData(cosEndAngle   * innerRadius, sinEndAngle   * innerRadius, vertex += 2); //     |    /|
            this.#AddVertexData(cosEndAngle   * outerRadius, sinEndAngle   * outerRadius, vertex += 2); //     |   / |
            this.#AddVertexData(cosEndAngle   * outerRadius, sinEndAngle   * outerRadius, vertex += 2); //     |  /  |
            this.#AddVertexData(cosStartAngle * outerRadius, sinStartAngle * outerRadius, vertex += 2); //     | /   |
            this.#AddVertexData(cosStartAngle * innerRadius, sinStartAngle * innerRadius, vertex += 2); // 0, 5|/____|1
        }
    }

    #UpdateStorageBuffer()
    {
        this.#Renderer.WriteBuffer(this.#StorageBuffer, this.#StorageData);
    }

    #CreateBuffers()
    {
        // Vertex buffer setup:
        const vertexBuffer = this.#Renderer.CreateBuffer({
            label: "Shape Vertex Buffer",
            size: this.#VertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.#Renderer.WriteBuffer(vertexBuffer, this.#VertexData);
        this.#Renderer.SetVertexBuffers(vertexBuffer);

        // Storage buffer setup:
        const storageBufferSize =
            2 * Float32Array.BYTES_PER_ELEMENT + // Position - 2 32bit floats
            2 * Float32Array.BYTES_PER_ELEMENT + // Scale    - 2 32bit floats
            4 * Float32Array.BYTES_PER_ELEMENT;  // Color    - 4 32bit floats

        this.#StorageBuffer = this.#Renderer.CreateBuffer({
            label: "Shape Storage Buffer",
            size: storageBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        this.#StorageBindGroup = this.#Renderer.CreateBindGroup(
            this.#Renderer.CreateBindGroupEntries({ buffer: this.#StorageBuffer })
        );

        this.#StorageData = new Float32Array(storageBufferSize / Float32Array.BYTES_PER_ELEMENT);
    }

    Update()
    {
        this.#Renderer.SetBindGroups(this.#StorageBindGroup);
        return this;
    }

    /** @param Vec2 */
    set Position(position)
    {
        this.#StorageData.set(position, this.#Offset.position);
        this.#UpdateStorageBuffer();
    }

    /** @param Vec2 */
    set Scale(scale)
    {
        this.#StorageData.set(scale, this.#Offset.scale);
        this.#UpdateStorageBuffer();
    }

    /** @param Vec4 */
    set Color(color)
    {
        this.#StorageData.set(color, this.#Offset.color);
        this.#UpdateStorageBuffer();
    }

    get Vertices()
    {
        return this.#Vertices;
    }
}
