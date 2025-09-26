import { CreateConstantObject } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { vec2, mat3 } from "wgpu-matrix";

export default class Shape
{
    /**
     * @typedef {import("../geometries").Shape} Geometry
     * @typedef {import("../materials").Shape} Material
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     */

    #Origin = mat3.create();
    #Scaling = mat3.create();
    #Rotation = mat3.create();
    #Translation = mat3.create();

    /** @type {string} */ #Label;
    /** @type {number} */ #Angle;
    /** @type {Geometry} */ #Geometry;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBuffer} */ #ProjectionBuffer;

    /** @type {boolean} */ #MatrixUpdate = false;
    /** @type {Float32Array} */ #ProjectionMatrix;
    /** @type {Material | undefined} */ #Material;

    /** @type {Vec2} */ #Scale    = vec2.set(1, 1);
    /** @type {Vec2} */ #Pivot    = vec2.set(0, 0);
    /** @type {Vec2} */ #Center   = vec2.set(0, 0);
    /** @type {Vec2} */ #Position = vec2.set(0, 0);

    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create() });
    /** @type {import("../pipelines/BasePipeline").BindGroup[]} */ #BindGroups = [];

    /**
     * @param {Geometry} geometry
     * @param {Material} [material]
     * @param {string} [label = "Shape"]
     */
    constructor(geometry, material, label = "Shape")
    {
        this.#Geometry = geometry;
        this.#Material = material;
        this.#Label    = label;

        this.Scale    = this.#Scale;
        this.Origin   = this.#Pivot;
        this.Position = this.#Position;
        this.Rotation = this.#Angle ?? 0;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {GPUBuffer} resolutionBuffer
     */
    SetRenderPipeline(Pipeline, resolutionBuffer)
    {
        this.#Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#Material?.CreateColorBuffer(Pipeline);
        this.#CreateProjectionBuffer(resolutionBuffer);
    }

    /**
     * @param {GPUBuffer} resolutionBuffer
     * @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor]
     */
    #CreateProjectionBuffer(resolutionBuffer, descriptor)
    {
        const { projection, buffer } = this.#Pipeline.CreateUniformBuffer("projection", {
            label: `${this.#Label} Projection Buffer`, ...descriptor
        });

        this.#ProjectionMatrix = mat3.identity(projection); this.#ProjectionBuffer = buffer;

        this.#BindGroups = this.#Pipeline.SetBindGroupFromResources(
            [resolutionBuffer, buffer, this.#Material?.ColorBuffer].filter(Boolean), 0, 0, `${this.#Label} Bind Group`
        );
    }

    UpdateProjectionMatrix()
    {
        if (this.#MatrixUpdate)
        {
            mat3.multiply(this.#Translation, this.#Rotation, this.#ProjectionMatrix);
            mat3.multiply(this.#ProjectionMatrix, this.#Scaling, this.#ProjectionMatrix);
            mat3.multiply(this.#ProjectionMatrix, this.#Origin, this.#ProjectionMatrix);

            this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, this.#ProjectionMatrix);

            const x = this.#Center[0] = this.#ProjectionMatrix[8];
            const y = this.#Center[1] = this.#ProjectionMatrix[9];

            const { Radius } = this.#Geometry;

            this.#BBox.min[0] = x - Radius;
            this.#BBox.min[1] = y - Radius;

            this.#BBox.max[0] = x + Radius;
            this.#BBox.max[1] = y + Radius;

            this.#MatrixUpdate = false;
        }
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

    get ProjectionBuffer()
    {
        return this.#ProjectionBuffer;
    }

    /** @param {Vec2} position */
    set Position(position)
    {
        this.#Position.set(position);
        mat3.translation(this.#Position, this.#Translation);
        this.#MatrixUpdate = true;
    }

    get Position()
    {
        return this.#Position;
    }

    /** @param {number} rotation */
    set Rotation(rotation)
    {
        this.#Angle = rotation;
        mat3.rotation(this.#Angle, this.#Rotation);
        this.#MatrixUpdate = true;
    }

    get Rotation()
    {
        return this.#Angle;
    }

    /** @param {Vec2} scale */
    set Scale(scale)
    {
        this.#Scale.set(scale);
        mat3.scaling(this.#Scale, this.#Scaling);
        this.#MatrixUpdate = true;
    }

    get Scale()
    {
        return this.#Scale;
    }

    /** @param {Vec2} origin */
    set Origin(origin)
    {
        const { Radius } = this.#Geometry;

        this.#Pivot[0] = origin[0]; //       -1
        this.#Pivot[1] = origin[1]; //        |
                                    // -1 --- 0 --- 1
        this.#Pivot[0] *= -Radius;  //        |
        this.#Pivot[1] *= -Radius;  //        1

        mat3.translation(this.#Pivot, this.#Origin);

        // Remove negative sign when `-0`:
        this.#Pivot[0] = origin[0] || 0;
        this.#Pivot[1] = origin[1] || 0;

        this.#MatrixUpdate = true;
    }

    get Origin()
    {
        return this.#Pivot;
    }

    get Center()
    {
        this.UpdateProjectionMatrix();
        return this.#Center;
    }

    get ProjectionMatrix()
    {
        this.UpdateProjectionMatrix();
        return this.#ProjectionMatrix;
    }

    get BoundingBox()
    {
        this.UpdateProjectionMatrix();
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
        this.#Geometry.Destroy();
        this.#Material?.Destroy();
        this.#Pipeline = undefined;
        this.#BindGroups.splice(0);
        this.#ProjectionBuffer?.destroy();
        this.#ProjectionBuffer = undefined;
    }
}
