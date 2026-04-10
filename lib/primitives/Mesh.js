let ID = 0;

/**
 * @typedef {Readonly<{ NONE: 0, SPHERE: 1, AABB: 2 }>} CullTest
 *
 * @exports CullTest
 */

import Node from "./Node";
import { mat3, mat4 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";
import { BINDINGS } from "#/pipelines/Constants";
import { MathUtils, GetParamArray } from "#/utils";

export default class Mesh extends Node
{
    /**
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
    /** @type {number} */ #Instances = 0;

    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {RenderPipeline | undefined} */ Pipeline;

    /** @type {Mat4} */ #WorldMatrix = mat4.identity();
    /** @type {Mat3} */ #NormalMatrix = mat3.identity();

    /** @type {GPUBuffer | undefined} */ #InstanceBuffer;
    /** @type {Float32Array<ArrayBuffer> | undefined} */ #InstanceMatrix;
    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ BindGroups = [];

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

    /**
     * @param {number} instances
     * @param {string} [vertexEntry = "vertex"]
     */
    AddInstanceBuffer(instances, vertexEntry = "vertex")
    {
        !this.Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before adding an instance buffer.`
        );

        this.#Instances = instances; this.CullTest = 0;
        this.#InstanceMatrix = new Float32Array(instances * 16);

        const Pipeline = /** @type {RenderPipeline} */ (this.Pipeline);
        Pipeline.DrawParams[1] = this.#Geometry.DrawParams[1] = instances;

        // Since `@location` cannot be applied to a `mat4x4f` vertex buffer input,
        // split the world matrix into 4 `vec4f` attributes, each with its own location.
        for (let i = instances; i--; ) this.#InstanceMatrix.set(this.WorldMatrix, i * 16);

        this.#InstanceBuffer = Pipeline.CreateVertexBuffer(
            this.#InstanceMatrix, { label: `${this.Label} Instance Buffer` }, vertexEntry, "instance"
        );

        Pipeline.AddVertexBuffers(this.#InstanceBuffer);
        Pipeline.WriteBuffer(this.#InstanceBuffer, this.#InstanceMatrix);
    }

    UpdateInstanceBuffer()
    {
        !this.#InstanceBuffer && ThrowError(ERROR.INSTANCE_BUFFER_NOT_FOUND, `\`Mesh.UpdateInstanceBuffer\` method.
            Call \`Mesh.AddInstanceBuffer\` method before updating it.`
        );

        /** @type {RenderPipeline} */ (this.Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#InstanceBuffer),
            /** @type {Float32Array<ArrayBuffer>} */ (this.#InstanceMatrix)
        );
    }

    /**
     * @param {Mat3} matrix
     * @param {number} instance
     * @param {boolean} [write = true]
     */
    SetInstanceMatrix(matrix, instance, write = true)
    {
        const instanceMatrix = /** @type {Float32Array<ArrayBuffer>} */ (this.#InstanceMatrix);

        const dataOffset = instance * 16, bufferOffset = dataOffset * Float32Array.BYTES_PER_ELEMENT;

        !this.#InstanceBuffer && ThrowError(ERROR.INSTANCE_BUFFER_NOT_FOUND, `\`Mesh.SetInstanceMatrix\` method.
            Call \`Mesh.AddInstanceBuffer\` method before setting an instance matrix.`
        );

        instanceMatrix.set(matrix, dataOffset);

        write && /** @type {RenderPipeline} */ (this.Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#InstanceBuffer), instanceMatrix, bufferOffset, dataOffset, 16
        );
    }

    /**
     * @param {number} instance
     * @param {Mat4} [matrix]
     */
    GetInstanceMatrix(instance, matrix = mat4.identity())
    {
        !this.#InstanceBuffer && ThrowError(ERROR.INSTANCE_BUFFER_NOT_FOUND, `\`Mesh.GetInstanceMatrix\` method.
            Call \`Mesh.AddInstanceBuffer\` method before extracting an instance matrix.`
        );

        return mat4.copy(/** @type {Float32Array<ArrayBuffer>} */ (this.#InstanceMatrix).slice(instance * 16), matrix);
    }

    get Instances()
    {
        return this.#Instances;
    }

    get MatrixBuffer()
    {
        return this.#MatrixBuffer;
    }

    get Geometry()
    {
        return this.#Geometry;
    }

    get Radius()
    {
        return this.#Geometry.Radius * MathUtils.GetMaxAxisScale(this.WorldMatrix);
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
        this.#InstanceMatrix = undefined;
        this.#MatrixBuffer = this.#MatrixBuffer?.destroy();
        this.#InstanceBuffer = this.#InstanceBuffer?.destroy();
    }
}
