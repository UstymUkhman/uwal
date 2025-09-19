import Node from "./Node";
import { mat4 } from "wgpu-matrix";
import { ERROR, ThrowError } from "#/Errors";

export default class Mesh extends Node
{
    /**
     * @typedef {import("../geometries").Mesh} Geometry
     * @typedef {import("../materials").Mesh} Material
     */

    /** @type {Geometry} */ #Geometry;
    /** @type {?Material} */ #Material;

    /** @type {Float32Array} */ #Projection;
    /** @type {RenderPipeline} */ #Pipeline;

    /** @type {GPUBuffer} */ #ProjectionBuffer;
    /** @type {?GPUBuffer[]} */ #BindGroupResources;

    /**
     * @param {Geometry} geometry
     * @param {Material} [material]
     * @param {string} [label = "Mesh"]
     * @param {Node} [parent = null]
     */
    constructor(geometry, material, label = "Mesh", parent = null)
    {
        super(label, parent);
        this.#Geometry = geometry;
        this.#Material = material;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {boolean} [setBindGroupResources = true]
     */
    SetRenderPipeline(Pipeline, setBindGroupResources = true)
    {
        this.#Pipeline = Pipeline;
        this.#Geometry.CreateBuffers(Pipeline);
        this.#Material?.CreateColorBuffer(Pipeline);
        this.#CreateProjectionBuffer(setBindGroupResources);
    }

    /**
     * @param {boolean} [setBindGroupResources = true]
     * @param {import("../pipelines/BasePipeline").BufferDescriptor} [descriptor]
     */
    #CreateProjectionBuffer(setBindGroupResources = true, descriptor)
    {
        const { projection, buffer } = this.#Pipeline.CreateUniformBuffer("projection",
            { label: `${this.Label} Projection Buffer`, ...descriptor }
        );

        this.#Projection = mat4.identity(projection); this.#ProjectionBuffer = buffer;

        if (setBindGroupResources)
        {
            this.#BindGroupResources = [buffer, this.#Material?.ColorBuffer].filter(Boolean);
            this.#Pipeline.SetBindGroupFromResources(this.#BindGroupResources, 0, 0, `${this.Label} Bind Group`);
        }
    }

    SetPipelineData()
    {
        !this.#Pipeline && ThrowError(ERROR.PIPELINE_NOT_FOUND, `RenderPipeline.
            Call \`Mesh.SetRenderPipeline\` method before setting its data.`
        );

        this.#Pipeline.SetBindGroupFromResources(this.#BindGroupResources);
        const { VertexBuffer, IndexBuffer, Vertices } = this.#Geometry;

        this.#Pipeline.SetVertexBuffers(VertexBuffer);
        this.#Pipeline.SetIndexBuffer(...IndexBuffer);
        this.#Pipeline.SetDrawParams(Vertices);
    }

    Update()
    {
        this.#Pipeline.WriteBuffer(this.#ProjectionBuffer, this.#Projection);
    }

    get ProjectionBuffer()
    {
        return this.#ProjectionBuffer;
    }

    get Projection()
    {
        return this.#Projection;
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
        this.#ProjectionBuffer.destroy();
        this.#ProjectionBuffer = undefined;
        this.#BindGroupResources?.splice(0);
    }
}
