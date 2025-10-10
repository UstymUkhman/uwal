import Node from "./Node";
import { mat4 } from "wgpu-matrix";
import Material from "#/materials/Mesh";
import { GetParamArray } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";

export default class Mesh extends Node
{
    /** @typedef {import("../geometries").Mesh} Geometry */

    /** @type {Geometry} */ #Geometry;
    /** @type {boolean} */ Visible = true;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {Material | null} */ #Material;
    /** @type {GPUBuffer} */ #ProjectionBuffer;

    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ #BindGroups = [];

    /**
     * @param {Geometry} geometry
     * @param {Material | null} [material = Material]
     * @param {string} [label = "Mesh"]
     * @param {Node} [parent = null]
     */
    constructor(geometry, material, label = "Mesh", parent = null)
    {
        super(label, parent);
        this.#Geometry = geometry;
        this.#Material = material === void 0 && new Material() || material;
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
        const { projection, buffer } = this.#Pipeline.CreateUniformBuffer("projection",
            { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.ProjectionMatrix = mat4.identity(projection); this.#ProjectionBuffer = buffer;
        resources = /** @type {GPUBindingResource[]} */ (GetParamArray(resources));

        this.#BindGroups = this.#Pipeline.SetBindGroupFromResources(
            [buffer, this.#Material?.ColorBuffer, ...resources].filter(Boolean), 0, 0, `${this.Label} Bind Group`
        );
    }

    /**
     * @override
     * @param {import("wgpu-matrix").Mat4Arg} cameraProjection
     */
    UpdateProjectionMatrix(cameraProjection)
    {
        const projectionMatrix = super.UpdateProjectionMatrix(cameraProjection);
        this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, projectionMatrix);
    }

    SetBindGroups()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before setting its data.`
        );

        this.#Pipeline.BindGroups = this.#BindGroups;
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
        this.#ProjectionBuffer.destroy();
        this.#ProjectionBuffer = undefined;
    }
}
