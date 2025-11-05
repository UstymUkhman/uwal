import Node2D from "./Node2D";
import { vec2, mat3 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";
import Material from "#/materials/ShapeMaterial";
import { GetParamArray, CreateConstantObject } from "#/utils";

export default class Shape extends Node2D
{
    /**
     * @typedef {import("../geometries").Shape} Geometry
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     */

    /** @type {Geometry} */ #Geometry;
    /** @type {boolean} */ Visible = true;
    /** @type {Material | null} */ #Material;

    /** @type {Vec2} */ #Origin = vec2.set(0, 0);
    /** @type {Vec2} */ #Center = vec2.set(0, 0);

    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {GPUBuffer | undefined} */ #ProjectionBuffer;

    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create() });
    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ #BindGroups = [];

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
        const { shapeModelViewProjection, buffer } = /** @type {RenderPipeline} */ (this.#Pipeline).CreateUniformBuffer(
            "shapeModelViewProjection", { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.ProjectionMatrix = mat3.identity(/** @type {Float32Array} */ (shapeModelViewProjection));
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
     * @param {import("wgpu-matrix").Mat3} cameraProjection
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

    /** @override */
    UpdateLocalMatrix()
    {
        super.UpdateLocalMatrix();

        const matrix = this.LocalMatrix;
        const { Radius } = this.#Geometry;

        this.#BBox.min[0] = matrix[8] - Radius;
        this.#BBox.min[1] = matrix[9] - Radius;

        this.#BBox.max[0] = matrix[8] + Radius;
        this.#BBox.max[1] = matrix[9] + Radius;

        mat3.translate(matrix, this.#Origin, matrix);

        this.#Center[0] = this.#Origin[0] + this.#BBox.max[0]
        this.#Center[1] = this.#Origin[1] + this.#BBox.max[1];
    }

    SetBindGroups()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Shape.SetRenderPipeline\` method before setting its data.`
        );

        /** @type {RenderPipeline} */ (this.#Pipeline).BindGroups = this.#BindGroups;
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
