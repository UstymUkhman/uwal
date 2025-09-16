// import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError } from "#/Errors";
import { mat4 } from "wgpu-matrix";

export default class Mesh
{
    /**
     * @typedef {import("../pipelines/RenderPipeline").VertexAttribute} VertexAttribute
     * @typedef {import("../geometries").Cube} Geometry
     * @typedef {import("../materials").Mesh} Material
     */

    #Projection = mat4.create();
    /** @type {string} */ #Label;
    /** @type {Geometry} */ #Geometry;

    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBuffer} */ #ProjectionBuffer;
    /** @type {Material | undefined} */ #Material;

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = { name: "position", format: "float32x3" }]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    static GetPositionBufferLayout(
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
    static GetTextureCoordsBufferLayout(Pipeline, attributes, stepMode = "vertex", vertexEntry = "vertex")
    {
        const label = !Array.isArray(attributes) && attributes?.name ||
            typeof attributes === "string" && attributes || "Coords";

        attributes ??= "textureCoords";
        Mesh.#CreateTextureCoordsBuffer(Pipeline, label);
        return Pipeline.CreateVertexBufferLayout(attributes, stepMode, vertexEntry);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = "Coords"]
     */
    static #CreateTextureCoordsBuffer(Pipeline, label = "Coords")
    {
        const textureData = new Float32Array(
        [
            // Top
            0.5 ,  0.5,
            0.75,  0.5,
            0.5 ,  1  ,
            0.75,  1  ,

            // Bottom
            0.25,  0.5,
            0.5 ,  0.5,
            0.25,  1  ,
            0.5 ,  1  ,

            // Front
            0   ,  0  ,
            0   ,  0.5,
            0.25,  0  ,
            0.25,  0.5,

            // Back
            0.5 ,  0  ,
            0.5 ,  0.5,
            0.75,  0  ,
            0.75,  0.5,

            // Left
            0   ,  0.5,
            0.25,  0.5,
            0   ,  1  ,
            0.25,  1  ,

            // Right
            0.25,  0  ,
            0.5 ,  0  ,
            0.25,  0.5,
            0.5 ,  0.5
        ]);

        const textureBuffer = Pipeline.CreateVertexBuffer(textureData, { label: `${label} Texture Buffer` });
        Pipeline.WriteBuffer(textureBuffer, textureData);
        Pipeline.AddVertexBuffers(textureBuffer);
    }

    /**
     * @param {Geometry} geometry
     * @param {Material} [material]
     * @param {string} [label = "Mesh"]
     */
    constructor(geometry, material, label = "Mesh")
    {
        this.#Geometry = geometry;
        this.#Material = material;
        this.#Label    = label;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {GPUBuffer} resolutionBuffer
     */
    SetRenderPipeline(Pipeline, resolutionBuffer)
    {
        this.#Pipeline = Pipeline;
        this.#CreateProjectionBuffer();
        this.#Geometry.CreateBuffers(Pipeline);
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers, offsets, sizes)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before adding vertex buffers.`
        );

        this.#Pipeline.AddVertexBuffers(vertexBuffers, offsets, sizes);
    }

    /**
     * @param {string} [uniformName = "projection"]
     * @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor]
     */
    #CreateProjectionBuffer(uniformName = "projection", descriptor)
    {
        this.#ProjectionBuffer = this.#Pipeline.CreateUniformBuffer(
            uniformName, { label: `${this.#Label} Projection Buffer`, ...descriptor }
        ).buffer;

        /* this.#ProjectionBuffer = this.#Pipeline.CreateBuffer({
            label: `${this.#Label} Projection Buffer`,
            size: this.#Projection.byteLength,
            usage: USAGE.UNIFORM
        }); */
    }

    // SetPipelineData()
    // {}

    Update()
    {
        this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, this.#Projection);
    }

    get ProjectionBuffer()
    {
        return this.#ProjectionBuffer;
    }

    get Projection()
    {
        return this.#Projection;
    }

    Destroy()
    {
        this.#Geometry.Destroy();
        this.#Material?.Destroy();
        this.#Pipeline = undefined;
        this.#ProjectionBuffer.destroy();
        this.#ProjectionBuffer = undefined;
    }
}
