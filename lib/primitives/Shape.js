/**
 * @typedef {Readonly<{ NONE: 0, AABB: 1 }>} CullTest
 *
 * @exports CullTest
 */

import Node2D from "./Node2D";
import { vec2, mat3 } from "wgpu-matrix";
import Material from "#/materials/ColorMaterial";
import { GetParamArray, CreateConstantObject } from "#/utils";

export default class Shape extends Node2D
{
    /**
     * @typedef {import("../geometries").Shape} Geometry
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     * @typedef {import("wgpu-matrix").Mat3} Mat3
     */

    /**
     * @type {CullTest[keyof CullTest]}
     * @default 1 Axis-Aligned Bounding Box
     */
    CullTest = 1;
    /** @type {Geometry} */ #Geometry;
    /** @type {Material | null} */ #Material;

    #BBox = CreateConstantObject({
        Min: vec2.create( Infinity,  Infinity),
        Max: vec2.create(-Infinity, -Infinity)
    });

    /** @type {Vec2} */ #Center = vec2.set(0, 0);
    /** @type {Vec2} */ #Origin = vec2.set(0, 0);
    /** @type {Mat3} */ #WorldMatrix = mat3.identity();

    /** @type {RenderPipeline | undefined} */ Pipeline;
    /** @type {GPUBuffer | undefined} */ #ProjectionBuffer;

    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ BindGroups = [];

    /**
     * @param {Geometry} geometry
     * @param {Material | null} [material = Material]
     * @param {string} [label = "Shape"]
     * @param {Node2D | null} [parent = null]
     */
    constructor(geometry, material, label = "Shape", parent = null)
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
        this.Pipeline = Pipeline;
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
        const { ShapeUniforms, buffer } = /** @type {RenderPipeline} */ (this.Pipeline).CreateUniformBuffer(
            "ShapeUniforms", { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.#ProjectionBuffer = buffer;

        this.ProjectionMatrix = mat3.identity(
            /** @type {Record<string, Float32Array>} */ (ShapeUniforms).viewProjection
        );

        this.#WorldMatrix = mat3.identity(/** @type {Record<string, Float32Array>} */ (ShapeUniforms).world);

        // Fake world matrices for light calculations:
        mat3.identity(/** @type {Record<string, Float32Array>} */ (ShapeUniforms).worldNormal);

        resources = /** @type {GPUBindingResource[]} */ (
            [buffer, this.#Material?.ColorBuffer, ...GetParamArray(resources)].filter(Boolean)
        );

        this.BindGroups = /** @type {RenderPipeline} */ (this.Pipeline).SetBindGroupFromResources(
            resources, 0, 0, `${this.Label} Bind Group`
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
            /** @type {GPUBuffer} */ (this.#ProjectionBuffer),
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

    get ProjectionBuffer()
    {
        return this.#ProjectionBuffer;
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

    get Material()
    {
        return this.#Material;
    }

    Destroy()
    {
        this.Pipeline = void 0;
        this.#Geometry.Destroy();
        this.#Material?.Destroy();
        this.BindGroups.splice(0);
        this.#ProjectionBuffer?.destroy();
        this.#ProjectionBuffer = undefined;
    }
}
