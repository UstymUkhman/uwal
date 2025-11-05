import Node from "./Node";
import { mat4 } from "wgpu-matrix";
import { GetParamArray } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import Material from "#/materials/MeshMaterial";

export default class Mesh extends Node
{
    /** @typedef {import("../geometries").Mesh} Geometry */

    /** @type {Geometry} */ #Geometry;
    /** @type {boolean} */ Visible = true;
    /** @type {Material | null} */ #Material;
    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {GPUBuffer | undefined} */ #ProjectionBuffer;

    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ #BindGroups = [];

    /**
     * @param {Geometry} geometry
     * @param {Material | null} [material = Material]
     * @param {string} [label = "Mesh"]
     * @param {Node | null} [parent = null]
     */
    constructor(geometry, material, label = "Mesh", parent = null)
    {
        super(label, parent);
        this.#Geometry = geometry;
        this.#Material = /** @type {Material | null} */ (
            material === void 0 && new Material() || material
        );
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {GPUBindingResource | GPUBindingResource[]} [resources]
     */
    SetRenderPipeline(Pipeline, resources)
    {
        this.#Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#Material?.CreateColorBuffer(Pipeline);
        this.#CreateProjectionBuffer(resources);
    }

    /**
     * @param {GPUBindingResource | GPUBindingResource[]} [resources]
     * @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor]
     */
    #CreateProjectionBuffer(resources, descriptor)
    {
        const { meshModelViewProjection, buffer } = /** @type {RenderPipeline} */ (this.#Pipeline).CreateUniformBuffer(
            "meshModelViewProjection", { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.ProjectionMatrix = mat4.identity(/** @type {Float32Array} */ (meshModelViewProjection));
        this.#ProjectionBuffer = buffer;

        resources = /** @type {GPUBindingResource[]} */ (
            [buffer, this.#Material?.ColorBuffer, ...GetParamArray(resources)].filter(Boolean)
        );

        this.#BindGroups = /** @type {RenderPipeline} */ (this.#Pipeline).SetBindGroupFromResources(
            resources, 0, 0, `${this.Label} Bind Group`
        );
    }

    /**
     * @override
     * @param {import("wgpu-matrix").Mat4} cameraProjection
     */
    UpdateProjectionMatrix(cameraProjection)
    {
        const projectionMatrix = super.UpdateProjectionMatrix(cameraProjection);

        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#ProjectionBuffer),
            /** @type {Float32Array<ArrayBuffer>} */ (projectionMatrix)
        );

        return projectionMatrix;
    }

    SetBindGroups()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before setting its data.`
        );

        /** @type {RenderPipeline} */ (this.#Pipeline).BindGroups = this.#BindGroups;
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

    get Pipeline()
    {
        return this.#Pipeline;
    }

    Destroy()
    {
        this.#Geometry.Destroy();
        this.#Material?.Destroy();
        this.#Pipeline = undefined;
        this.#BindGroups.splice(0);
        this.#ProjectionBuffer?.destroy();
        this.#ProjectionBuffer = undefined;
    }
}
