/**
 * @typedef {Readonly<{ NONE: 0, SPHERE: 1, AABB: 2 }>} CullTest
 *
 * @exports CullTest
 */

import Node from "./Node";
import { GetParamArray } from "#/utils";
import { mat3, mat4 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";
import Material from "#/materials/ColorMaterial";

export default class Mesh extends Node
{
    /**
     * @typedef {import("../pipelines/BasePipeline").BindGroup} BindGroup
     * @typedef {import("../geometries").Mesh} Geometry
     * @import {Mat3, Mat4} from "wgpu-matrix"
     */

    /**
     * @type {CullTest[keyof CullTest]}
     * @default 1 Bounding Sphere
     */
    CullTest = 1;

    /** @type {Geometry} */ #Geometry;
    /** @type {boolean} */ Visible = true;
    /** @type {Material | null} */ #Material;

    /** @type {BindGroup[]} */ #BindGroups = [];
    /** @type {Mat4} */ #WorldMatrix = mat4.identity();
    /** @type {Mat3} */ #NormalMatrix = mat3.identity();
    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {GPUBuffer | undefined} */ #ProjectionBuffer;

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
        const { MeshUniforms, buffer } = /** @type {RenderPipeline} */ (this.#Pipeline).CreateUniformBuffer(
            "MeshUniforms", { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.#ProjectionBuffer = buffer;

        this.ProjectionMatrix = mat4.identity(
            /** @type {Record<string, Float32Array>} */ (MeshUniforms).modelViewProjection
        );

        this.#WorldMatrix = mat4.identity(/** @type {Record<string, Float32Array>} */ (MeshUniforms).world);
        this.#NormalMatrix = mat3.identity(/** @type {Record<string, Float32Array>} */ (MeshUniforms).worldNormal);

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
        const { WorldMatrix } = this;
        mat4.copy(WorldMatrix, this.#WorldMatrix);

        const projectionMatrix = super.UpdateProjectionMatrix(cameraProjection);

        // Invert and transpose the world matrix into a normal matrix for light calculations:
        mat3.fromMat4(mat4.transpose(mat4.inverse(WorldMatrix)), this.#NormalMatrix);

        /** @type {RenderPipeline} */ (this.#Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#ProjectionBuffer),
            /** @type {BufferSource} */ (projectionMatrix.buffer)
        );

        return projectionMatrix;
    }

    UpdateBoundingBox()
    {
        return this.#Geometry.UpdateBoundingBox(this.WorldMatrix);
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
