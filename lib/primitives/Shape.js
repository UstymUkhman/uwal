import Node2D from "./Node2D";
import { vec2, mat3 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";
import { CreateConstantObject } from "#/utils";

export default class Shape extends Node2D
{
    /**
     * @typedef {import("../geometries").Shape} Geometry
     * @typedef {import("../materials").Shape} Material
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     */

    /** @type {Geometry} */ #Geometry;
    /** @type {boolean} */ Visible = true;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBuffer} */ #ProjectionBuffer;

    /** @type {Vec2} */ #Origin = vec2.set(0, 0);
    /** @type {Vec2} */ #Center = vec2.set(0, 0);
    /** @type {Material | undefined} */ #Material;

    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create() });
    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ #BindGroups = [];

    /**
     * @param {Geometry} geometry
     * @param {Material} [material]
     * @param {string} [label = "Shape"]
     * @param {Node2D} [parent = null]
     */
    constructor(geometry, material, label = "Shape", parent = null)
    {
        super(label, parent);
        this.#Geometry = geometry;
        this.#Material = material;
    }

    /** @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor] */
    #CreateProjectionBuffer(descriptor)
    {
        const { projection, buffer } = this.#Pipeline.CreateUniformBuffer("projection", {
            label: `${this.Label} Projection Buffer`, ...descriptor
        });

        this.ProjectionMatrix = mat3.identity(projection); this.#ProjectionBuffer = buffer;

        this.#BindGroups = this.#Pipeline.SetBindGroupFromResources(
            [buffer, this.#Material?.ColorBuffer].filter(Boolean), 0, 0, `${this.Label} Bind Group`
        );
    }

    /** @param {RenderPipeline} Pipeline */
    SetRenderPipeline(Pipeline)
    {
        this.#Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#Material?.CreateColorBuffer(Pipeline);
        this.#CreateProjectionBuffer();
    }

    SetPipelineData()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Use \`Shape.SetRenderPipeline\` method before setting its data.`
        );

        const { VertexBuffers, IndexBuffer, Vertices } = this.#Geometry;

        this.#Pipeline.BindGroups = this.#BindGroups;
        this.#Pipeline.VertexBuffers = VertexBuffers;
        this.#Pipeline.IndexBuffer = IndexBuffer;
        this.#Pipeline.SetDrawParams(Vertices);
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

    /**
     * @override
     * @param {import("wgpu-matrix").Mat3Arg} cameraProjection
     */
    UpdateProjectionMatrix(cameraProjection)
    {
        const projection = super.UpdateProjectionMatrix(cameraProjection);
        this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, projection);
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
