let ID = 0;

/**
 * @typedef {Readonly<{ NONE: 0, CIRCLE: 1, AABB: 2 }>} CullTest
 *
 * @exports CullTest
 */

import Node2D from "./Node2D";
import { vec2, mat3 } from "wgpu-matrix";
import { BINDINGS } from "#/pipelines/Constants";
import { GetParamArray, CreateConstantObject } from "#/utils";

export default class Shape extends Node2D
{
    /**
     * @typedef {import("../geometries").Shape} Geometry
     * @typedef {import("wgpu-matrix").Vec2} Vec2
     * @typedef {import("wgpu-matrix").Mat3} Mat3
     */

    /**
     * @type {CullTest[keyof CullTest]}
     * @default 2 Axis-Aligned Bounding Box
     */
    CullTest = 2;

    /** @type {number} */ #ID = 0;
    /** @type {Geometry} */ #Geometry;

    #BBox = CreateConstantObject({
        Min: vec2.create( Infinity,  Infinity),
        Max: vec2.create(-Infinity, -Infinity)
    });

    /** @type {Vec2} */ #Center = vec2.create();
    /** @type {Vec2} */ #Origin = vec2.create();
    /** @type {Mat3} */ #WorldMatrix = mat3.identity();

    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {RenderPipeline | undefined} */ Pipeline;

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
        mat3.copy(cameraProjection, this.ProjectionMatrix);

        /**
         * It's possible for a `Node2D` to not have any parent, so the correct matrix needs to be chosen.
         * Once hardware instancing is supported by the engine, every `Shape` will have at least
         * the `Scene` as its parent element, and this matrix selection can be safely removed.
         * @see {@link https://ustymukhman.github.io/uwal/dist/examples/examples.html#textures-instancing}
         */
        mat3.copy(this.Parent && this.WorldMatrix || this.LocalMatrix, this.#WorldMatrix);

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
        this.#MatrixBuffer?.destroy();
        this.#MatrixBuffer = undefined;
    }
}
