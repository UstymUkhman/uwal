import Node from "./Node";
import { mat4 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";

export default class Mesh extends Node
{
    /**
     * @typedef {import("../geometries").Mesh} Geometry
     * @typedef {import("../materials").Mesh} Material
     */

    /** @type {Geometry} */ #Geometry;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBuffer} */ #ProjectionBuffer;
    /** @type {Material | undefined} */ #Material;

    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ #BindGroups = [];

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

    /**
     * @param {RenderPipeline} Pipeline
     * @param {boolean} [setBindGroups = true]
     */
    SetRenderPipeline(Pipeline, setBindGroups = true)
    {
        this.#Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#Material?.CreateColorBuffer(Pipeline);
        this.#CreateProjectionBuffer(setBindGroups);
    }

    /**
     * @param {boolean} [setBindGroups = true]
     * @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor]
     */
    #CreateProjectionBuffer(setBindGroups = true, descriptor)
    {
        const { projection, buffer } = this.#Pipeline.CreateUniformBuffer("projection",
            { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.ProjectionMatrix = mat4.identity(projection); this.#ProjectionBuffer = buffer;

        setBindGroups && (this.#BindGroups = this.#Pipeline.SetBindGroupFromResources(
            [buffer, this.#Material?.ColorBuffer].filter(Boolean), 0, 0, `${this.Label} Bind Group`
        ));
    }

    /** @param {import("wgpu-matrix").Mat4Arg} cameraProjection */
    UpdateProjectionMatrix(cameraProjection)
    {
        const projectionMatrix = super.UpdateProjectionMatrix(cameraProjection);
        this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, projectionMatrix);
    }

    SetPipelineData()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before setting its data.`
        );

        const { VertexBuffers, IndexBuffer, Vertices } = this.#Geometry;

        this.#Pipeline.BindGroups = this.#BindGroups;
        this.#Pipeline.VertexBuffers = VertexBuffers;
        this.#Pipeline.IndexBuffer = IndexBuffer;
        this.#Pipeline.SetDrawParams(Vertices);
    }

    get ProjectionBuffer()
    {
        return this.#ProjectionBuffer;
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
        this.#BindGroups.splice(0);
        this.#ProjectionBuffer.destroy();
        this.#ProjectionBuffer = undefined;
    }
}
