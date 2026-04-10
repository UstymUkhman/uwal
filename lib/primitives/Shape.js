let ID = 0;

/**
 * @typedef {Readonly<{ NONE: 0, CIRCLE: 1, AABB: 2 }>} CullTest
 *
 * @exports CullTest
 */

import Node2D from "./Node2D";
import { vec2, mat3 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";
import { BINDINGS } from "#/pipelines/Constants";
import { GetParamArray, CreateConstantObject } from "#/utils";

export default class Shape extends Node2D
{
    /**
     * @typedef {import("../geometries").Shape} Geometry
     * @import {Vec2, Mat3} from "wgpu-matrix"
     */

    /**
     * @type {CullTest[keyof CullTest]}
     * @default 2 Axis-Aligned Bounding Box
     */
    CullTest = 2;

    /** @type {number} */ #ID = 0;
    /** @type {Geometry} */ #Geometry;
    /** @type {number} */ #Instances = 0;

    #BBox = CreateConstantObject({
        Min: vec2.create( Infinity,  Infinity),
        Max: vec2.create(-Infinity, -Infinity)
    });

    /** @type {Vec2} */ #Center = vec2.create();
    /** @type {Vec2} */ #Origin = vec2.create();

    /** @type {Mat3} */ #WorldMatrix = mat3.identity();
    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {RenderPipeline | undefined} */ Pipeline;

    /** @type {GPUBuffer | undefined} */ #InstanceBuffer;
    /** @type {Float32Array<ArrayBuffer> | undefined} */ #InstanceMatrix;
    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ BindGroups = [];

    /**
     * @param {Geometry} geometry
     * @param {string} [label = "Shape"]
     * @param {Node2D | null} [parent = null]
     */
    constructor(geometry, label = "Shape", parent = null)
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
        const { ShapeMatrix, buffer } = /** @type {RenderPipeline} */ (this.Pipeline).CreateUniformBuffer(
            "ShapeMatrix", { label: `${this.Label} Matrix Buffer`, ...descriptor }
        );

        this.#MatrixBuffer = buffer;

        this.ProjectionMatrix = mat3.identity(
            /** @type {Record<string, Float32Array>} */ (ShapeMatrix).viewProjection
        );

        this.#WorldMatrix = mat3.identity(/** @type {Record<string, Float32Array>} */ (ShapeMatrix).world);

        // Fake world matrices for light calculations:
        mat3.identity(/** @type {Record<string, Float32Array>} */ (ShapeMatrix).worldNormal);

        resources = /** @type {GPUBindingResource[]} */ ([buffer, ...GetParamArray(resources)].filter(Boolean));

        bindings = GetParamArray(bindings).filter(Boolean);
        bindings.unshift(BINDINGS.SHAPE_MATRIX);

        this.BindGroups = /** @type {RenderPipeline} */ (this.Pipeline).SetBindGroupFromResources(
            resources, bindings, 0, `${this.Label} Bind Group`
        );
    }

    /** @param {Mat3} cameraProjection */
    UpdateProjectionMatrix(cameraProjection)
    {
        mat3.copy(this.WorldMatrix, this.#WorldMatrix);
        mat3.copy(cameraProjection, this.ProjectionMatrix);

        /** @type {RenderPipeline} */ (this.Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {BufferSource} */ (this.ProjectionMatrix.buffer)
        );

        return this.ProjectionMatrix;
    }

    /** @override */
    UpdateWorldMatrix()
    {
        super.UpdateWorldMatrix();

        const matrix = this.WorldMatrix;
        const { Radius } = this.#Geometry;

        this.#Center[0] = matrix[8] - this.#Origin[0];
        this.#Center[1] = matrix[9] - this.#Origin[1];

        this.#BBox.Min[0] = this.#Center[0] - Radius;
        this.#BBox.Min[1] = this.#Center[1] - Radius;

        this.#BBox.Max[0] = this.#Center[0] + Radius;
        this.#BBox.Max[1] = this.#Center[1] + Radius;

        return this.#BBox;
    }

    /** @override */
    UpdateLocalMatrix()
    {
        super.UpdateLocalMatrix();

        const matrix = this.LocalMatrix;

        mat3.translate(matrix, this.#Origin, matrix);
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
            Call \`Shape.SetRenderPipeline\` method before adding an instance buffer.`
        );

        this.#Instances = instances; this.CullTest = 0;
        this.#InstanceMatrix = new Float32Array(instances * 9);

        const Pipeline = /** @type {RenderPipeline} */ (this.Pipeline);
        Pipeline.DrawParams[1] = this.#Geometry.DrawParams[1] = instances;

        // Since `@location` cannot be applied to a `mat3x3f` vertex buffer input,
        // split the world matrix into 3 `vec3f` attributes, each with its own location.
        const columns = Array.from({ length: 3 }).map((_, c, __, s = c * 3 + c) => this.WorldMatrix.slice(s, s + 3));

        for (let i = instances; i--; ) for (let c = 3; c--; ) this.#InstanceMatrix.set(columns[c], i * 9 + c * 3);

        this.#InstanceBuffer = Pipeline.CreateVertexBuffer(
            this.#InstanceMatrix, { label: `${this.Label} Instance Buffer` }, vertexEntry, "instance"
        );

        Pipeline.AddVertexBuffers(this.#InstanceBuffer);
        Pipeline.WriteBuffer(this.#InstanceBuffer, this.#InstanceMatrix);
    }

    UpdateInstanceBuffer()
    {
        !this.#InstanceBuffer && ThrowError(ERROR.INSTANCE_BUFFER_NOT_FOUND, `\`Shape.UpdateInstanceBuffer\` method.
            Call \`Shape.AddInstanceBuffer\` method before updating it.`
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

        const dataOffset = instance * 9, bufferOffset = dataOffset * Float32Array.BYTES_PER_ELEMENT;

        !this.#InstanceBuffer && ThrowError(ERROR.INSTANCE_BUFFER_NOT_FOUND, `\`Shape.SetInstanceMatrix\` method.
            Call \`Shape.AddInstanceBuffer\` method before setting an instance matrix.`
        );

        instanceMatrix.set(matrix.slice(0,  3), dataOffset + 0);
        instanceMatrix.set(matrix.slice(4,  7), dataOffset + 3);
        instanceMatrix.set(matrix.slice(8, 11), dataOffset + 6);

        write && /** @type {RenderPipeline} */ (this.Pipeline).WriteBuffer(
            /** @type {GPUBuffer} */ (this.#InstanceBuffer), instanceMatrix, bufferOffset, dataOffset, 9
        );
    }

    /**
     * @param {number} instance
     * @param {Mat3} [matrix]
     */
    GetInstanceMatrix(instance, matrix = mat3.identity())
    {
        const dataOffset = instance * 9;

        const instanceMatrix = /** @type {Float32Array<ArrayBuffer>} */ (this.#InstanceMatrix);

        !this.#InstanceBuffer && ThrowError(ERROR.INSTANCE_BUFFER_NOT_FOUND, `\`Shape.GetInstanceMatrix\` method.
            Call \`Shape.AddInstanceBuffer\` method before extracting an instance matrix.`
        );

        matrix.set(instanceMatrix.slice(dataOffset + 0, dataOffset + 3), 0);
        matrix.set(instanceMatrix.slice(dataOffset + 3, dataOffset + 6), 4);
        matrix.set(instanceMatrix.slice(dataOffset + 6, dataOffset + 9), 8);

        return matrix;
    }

    get Instances()
    {
        return this.#Instances;
    }

    get MatrixBuffer()
    {
        return this.#MatrixBuffer;
    }

    /** @param {Vec2} origin */
    set Origin(origin)
    {
        this.#Origin[0] = -origin[0];
        this.#Origin[1] = -origin[1];
        const matrix = this.LocalMatrix;
        mat3.translate(matrix, origin, matrix);
    }

    get Origin()
    {
        return this.#Origin;
    }

    get Center()
    {
        return this.#Center;
    }

    get BoundingBox()
    {
        return this.#BBox;
    }

    get Geometry()
    {
        return this.#Geometry;
    }

    get Radius()
    {
        return this.#Geometry.Radius * Math.max(...this.Scaling);
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
