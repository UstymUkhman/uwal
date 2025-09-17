import { CreateConstantObject } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { vec2, mat3 } from "wgpu-matrix";

export default class Shape
{
    /**
     * @typedef {import("../pipelines/RenderPipeline").VertexAttribute} VertexAttribute
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
    /** @type {Float32Array} */ #Projection;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {GPUBuffer} */ #ProjectionBuffer;

    /** @type {boolean} */ #MatrixUpdate = false;
    /** @type {Material | undefined} */ #Material;
    /** @type {GPUBuffer[]} */ #BindGroupResources;

    /** @type {Vec2} */ #Scale    = vec2.set(1, 1);
    /** @type {Vec2} */ #Pivot    = vec2.set(0, 0);
    /** @type {Vec2} */ #Center   = vec2.set(0, 0);
    /** @type {Vec2} */ #Position = vec2.set(0, 0);

    #BBox = CreateConstantObject({ min: vec2.create(), max: vec2.create() });

    /**
     * @param {RenderPipeline} Pipeline
     * @param {VertexAttribute | VertexAttribute[]} [attributes = "position"]
     * @param {GPUVertexStepMode} [stepMode = "vertex"]
     * @param {string} [vertexEntry = "vertex"]
     */
    static GetPositionBufferLayout(Pipeline, attributes = "position", stepMode = "vertex", vertexEntry = "vertex")
    {
        return Pipeline.CreateVertexBufferLayout(attributes, stepMode, vertexEntry);
    }

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
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers, offsets, sizes)
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Use \`Shape.SetRenderPipeline\` method before adding vertex buffers.`
        );

        this.#Pipeline.AddVertexBuffers(vertexBuffers, offsets, sizes);
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

        this.#Projection = projection; this.#ProjectionBuffer = buffer;

        this.#BindGroupResources = [resolutionBuffer, buffer, this.#Material?.ColorBuffer].filter(Boolean);
        this.#Pipeline.SetBindGroupFromResources(this.#BindGroupResources, 0, 0, `${this.#Label} Bind Group`);
    }

    SetPipelineData()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Use \`Shape.SetRenderPipeline\` method before setting its data.`
        );

        this.#Pipeline.SetBindGroupFromResources(this.#BindGroupResources);
        const { VertexBuffer, IndexBuffer, Vertices } = this.#Geometry;

        this.#Pipeline.SetVertexBuffers(VertexBuffer);
        this.#Pipeline.SetIndexBuffer(...IndexBuffer);
        this.#Pipeline.SetDrawParams(Vertices);
    }

    Update()
    {
        if (this.#MatrixUpdate)
        {
            mat3.multiply(this.#Translation, this.#Rotation, this.#Projection);
            mat3.multiply(this.#Projection, this.#Scaling, this.#Projection);
            mat3.multiply(this.#Projection, this.#Origin, this.#Projection);

            this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, this.#Projection);

            const x = this.#Center[0] = this.#Projection[8];
            const y = this.#Center[1] = this.#Projection[9];

            const { Radius } = this.#Geometry;

            this.#BBox.min[0] = x - Radius;
            this.#BBox.min[1] = y - Radius;

            this.#BBox.max[0] = x + Radius;
            this.#BBox.max[1] = y + Radius;

            this.#MatrixUpdate = false;
        }
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
        this.Update();
        return this.#Center;
    }

    get Transform()
    {
        this.Update();
        return this.#Projection;
    }

    get BoundingBox()
    {
        this.Update();
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
        this.#ProjectionBuffer?.destroy();
        this.#ProjectionBuffer = undefined;
        this.#BindGroupResources?.splice(0);
    }
}
