let ID = 0;

/**
 * @typedef {Readonly<{ NONE: 0, SPHERE: 1, AABB: 2 }>} CullTest
 *
 * @exports CullTest
 */

import Node from "./Node";
import { GetParamArray } from "#/utils";
import { mat3, mat4 } from "wgpu-matrix";
import { BINDINGS } from "#/pipelines/Constants";

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

    /** @type {number} */ #ID = 0;
    /** @type {Geometry} */ #Geometry;
    /** @type {BindGroup[]} */ BindGroups = [];

    /** @type {RenderPipeline | undefined} */ Pipeline;
    /** @type {Mat4} */ #WorldMatrix = mat4.identity();
    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {Mat3} */ #NormalMatrix = mat3.identity();

    /**
     * @param {Geometry} geometry
     * @param {string} [label = "Mesh"]
     * @param {Node | null} [parent = null]
     */
    constructor(geometry, label = "Mesh", parent = null)
    {
        super(label, parent);

        this.#ID = ID++;
        this.#Geometry = geometry;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {GPUBindingResource | GPUBindingResource[]} [resources]
     * @param {number | number[]} [bindings]
     */
    SetRenderPipeline(Pipeline, resources, bindings)
    {
        this.Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#CreateMatrixBuffer(resources, bindings);
    }

    /**
     * @param {GPUBindingResource | GPUBindingResource[]} [resources]
     * @param {number | number[]} [bindings]
     * @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor]
     */
    #CreateMatrixBuffer(resources, bindings, descriptor)
    {
        const { MeshMatrix, buffer } = /** @type {RenderPipeline} */ (this.Pipeline).CreateUniformBuffer(
            "MeshMatrix", { label: `${this.Label} Matrix Buffer`, ...descriptor }
        );

        this.#MatrixBuffer = buffer;

        this.ProjectionMatrix = mat4.identity(
            /** @type {Record<string, Float32Array>} */ (MeshMatrix).viewProjection
        );

        this.#WorldMatrix = mat4.identity(/** @type {Record<string, Float32Array>} */ (MeshMatrix).world);
        this.#NormalMatrix = mat3.identity(/** @type {Record<string, Float32Array>} */ (MeshMatrix).worldNormal);

        resources = /** @type {GPUBindingResource[]} */ ([buffer, ...GetParamArray(resources)].filter(Boolean));

        bindings = GetParamArray(bindings).filter(Boolean);
        bindings.unshift(BINDINGS.MESH_MATRIX);

        this.BindGroups = /** @type {RenderPipeline} */ (this.Pipeline).SetBindGroupFromResources(
            resources, bindings, 0, `${this.Label} Bind Group`
        );
    }

    /** @param {import("wgpu-matrix").Mat4} cameraProjection */
    UpdateProjectionMatrix(cameraProjection)
    {
        const { WorldMatrix } = this;
        mat4.copy(WorldMatrix, this.#WorldMatrix);
        mat4.copy(cameraProjection, this.ProjectionMatrix);

        // Invert and transpose the world matrix into a normal matrix for light calculations:
        mat3.fromMat4(mat4.transpose(mat4.inverse(WorldMatrix)), this.#NormalMatrix);

        /** @type {RenderPipeline} */ (this.Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {BufferSource} */ (this.ProjectionMatrix.buffer)
        );

        return this.ProjectionMatrix;
    }

    UpdateBoundingBox()
    {
        return this.#Geometry.UpdateBoundingBox(this.WorldMatrix);
    }

    /** @param {RenderPipeline} Pipeline */
    CreateColorBuffer(Pipeline)
    {
        return Pipeline.CreateUniformBuffer("color", { label: `${this.Label} Color Buffer` });
    }

    get MatrixBuffer()
    {
        return this.#MatrixBuffer;
    }

    get Geometry()
    {
        return this.#Geometry;
    }

    get ID()
    {
        return this.#ID;
    }

    Destroy()
    {
        this.Pipeline = void 0;
        this.#Geometry.Destroy();
        this.BindGroups.splice(0);
        this.#MatrixBuffer?.destroy();
        this.#MatrixBuffer = undefined;
    }
}
