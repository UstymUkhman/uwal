import Node from "./Node";
import { mat4 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";

export default class Mesh extends Node
{
    /**
     * @typedef {import("../pipelines/RenderPipeline").VertexAttribute} VertexAttribute
     * @typedef {import("../geometries").Cube} Geometry
     * @typedef {import("../materials").Mesh} Material
     */

    /** @type {Geometry} */ #Geometry;
    /** @type {Float32Array} */ #Projection;
    /** @type {RenderPipeline} */ #Pipeline;

    /** @type {GPUBuffer} */ #ProjectionBuffer;
    /** @type {Material | undefined} */ #Material;
    /** @type {GPUBuffer[]} */ #BindGroupResources;

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
     * @param {Node} [parent = null]
     */
    constructor(geometry, material, label = "Mesh", parent = null)
    {
        super(label, parent);
        this.#Geometry = geometry;
        this.#Material = material;
    }

    /** @param {RenderPipeline} Pipeline */
    SetRenderPipeline(Pipeline)
    {
        this.#Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#Material?.CreateColorBuffer(Pipeline);
        this.#CreateProjectionBuffer();
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

    /** @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor] */
    #CreateProjectionBuffer(descriptor)
    {
        const { projection, buffer } = this.#Pipeline.CreateUniformBuffer("projection",
            { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.#Projection = projection; this.#ProjectionBuffer = buffer;

        this.#BindGroupResources = [buffer, this.#Material?.ColorBuffer].filter(Boolean);
        this.#Pipeline.SetBindGroupFromResources(this.#BindGroupResources, 0, 0, `${this.Label} Bind Group`);
    }

    SetPipelineData()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before setting its data.`
        );

        this.#Pipeline.SetBindGroupFromResources(this.#BindGroupResources);
        const { VertexBuffer, IndexBuffer, Vertices } = this.#Geometry;

        this.#Pipeline.SetVertexBuffers(VertexBuffer);
        this.#Pipeline.SetIndexBuffer(...IndexBuffer);
        this.#Pipeline.SetDrawParams(Vertices);
    }

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

    get Geometry()
    {
        return this.#Geometry;
    }

    get Material()
    {
        return this.#Material;
    }

    Destroy()
    {
        this.#Geometry.Destroy();
        this.#Material?.Destroy();
        this.#Pipeline = undefined;
        this.#ProjectionBuffer.destroy();
        this.#ProjectionBuffer = undefined;
        this.#BindGroupResources?.splice(0);
    }
}
