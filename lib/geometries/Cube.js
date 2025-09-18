import Mesh from "./Mesh";

export default class Cube extends Mesh
{
    /** @type {Uint16Array | undefined} */ #IndexData;
    /** @type {Float32Array | undefined} */ #VertexData;

    /** @param {string} [label = "Cube"] */
    constructor(label = "Cube")
    {
        super(label, "uint16");
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.Label]
     */
    #CreateVertexBuffer(Pipeline, label = this.Label)
    {
        super.CreateVertexBuffer(Pipeline, this.#VertexData ?? new Float32Array(
        [
            // Top
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,

            // Bottom
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,
             0.5, -0.5, -0.5,
            -0.5, -0.5, -0.5,

            // Front
            -0.5,  0.5,  0.5,
            -0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
             0.5, -0.5,  0.5,

            // Back
             0.5,  0.5, -0.5,
             0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
            -0.5, -0.5, -0.5,

            // Left
            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5, -0.5, -0.5,

            // Right
            0.5,   0.5, -0.5,
            0.5,   0.5,  0.5,
            0.5,  -0.5, -0.5,
            0.5,  -0.5,  0.5
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
        return this.#IndexData?.length ?? 36;
    }

    Destroy()
    {
        super.Destroy();
        this.#IndexData = undefined;
        this.#VertexData = undefined;
    }
}
