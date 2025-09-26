import Mesh from "./Mesh";

export default class Cube extends Mesh
{
    /** @type {Uint16Array | undefined} */ #IndexData;
    /** @type {Float32Array | undefined} */ #VertexData;

    /** @typedef {import("../pipelines/RenderPipeline").VertexAttribute} VertexAttribute */

    /** @param {string} [label = "Cube"] */
    constructor(label = "Cube")
    {
        super(label, "uint16");
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = { name: "position", format: "float32x3" }]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    GetPositionBufferLayout(
        Pipeline,
        attributes = { name: "position", format: "float32x3" },
        stepMode = "vertex",
        vertexEntry = "vertex"
    ) {
        return Pipeline.CreateVertexBufferLayout(attributes, stepMode, vertexEntry);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "textureCoords"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    CreateTextureCoordsBuffer(Pipeline, attributes, stepMode = "vertex", vertexEntry = "vertex")
    {
        const label = !Array.isArray(attributes) && attributes?.name ||
            typeof attributes === "string" && attributes || "Texture Coords";

        attributes ??= "textureCoords";

        const data = new Float32Array(
        [
            0.5 , 0.5, 0.75, 0.5, 0.5 , 1  , 0.75, 1  , // Top
            0.25, 0.5, 0.5 , 0.5, 0.25, 1  , 0.5 , 1  , // Bottom
            0   , 0  , 0   , 0.5, 0.25, 0  , 0.25, 0.5, // Front
            0.5 , 0  , 0.5 , 0.5, 0.75, 0  , 0.75, 0.5, // Back
            0   , 0.5, 0.25, 0.5, 0   , 1  , 0.25, 1  , // Left
            0.25, 0  , 0.5 , 0  , 0.25, 0.5, 0.5 , 0.5  // Right
        ]);

        return this.AddVertexBuffer(Pipeline, data, attributes, stepMode, vertexEntry);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {Float16Array | Float32Array | Uint32Array | Int32Array} data
     * @param {VertexAttribute | VertexAttribute[]} attributes
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    AddVertexBuffer(Pipeline, data, attributes, stepMode = "vertex", vertexEntry = "vertex")
    {
        const { buffer, layout } = Pipeline.CreateVertexBuffer(attributes, this.Vertices, stepMode, vertexEntry);
        this.VertexBuffers = Pipeline.AddVertexBuffers(buffer);
        Pipeline.WriteBuffer(buffer, data);
        return { buffer, layout };
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.Label]
     */
    #CreateVertexBuffer(Pipeline, label = this.Label)
    {
        super.CreateVertexBuffer(Pipeline, this.#VertexData ?? new Float32Array(
        [
            -0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5, -0.5,  0.5,  0.5, -0.5, // Top
             0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5, -0.5, -0.5, -0.5, -0.5, // Bottom
            -0.5,  0.5,  0.5, -0.5, -0.5,  0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5, // Front
             0.5,  0.5, -0.5,  0.5, -0.5, -0.5, -0.5,  0.5, -0.5, -0.5, -0.5, -0.5, // Back
            -0.5,  0.5,  0.5, -0.5,  0.5, -0.5, -0.5, -0.5,  0.5, -0.5, -0.5, -0.5, // Left
             0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5,  0.5  // Right
        ]), label);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.Label]
     */
    #CreateIndexBuffer(Pipeline, label = this.Label)
    {
        super.CreateIndexBuffer(Pipeline, this.#IndexData ?? new Uint16Array(
        [
             0,  1,  2,  2,  1,  3, // Top
             4,  5,  6,  6,  5,  7, // Bottom
             8,  9, 10, 10,  9, 11, // Front
            12, 13, 14, 14, 13, 15, // Back
            16, 17, 18, 18, 17, 19, // Left
            20, 21, 22, 22, 21, 23  // Right
        ]), label);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.Label]
     */
    CreateBuffers(Pipeline, label = this.Label)
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
        return (this.#VertexData && this.#VertexData.length / 3) ?? this.#IndexData?.length ?? super.Vertices ?? 24;
    }

    Destroy()
    {
        super.Destroy();
        this.#IndexData = undefined;
        this.#VertexData = undefined;
    }
}
