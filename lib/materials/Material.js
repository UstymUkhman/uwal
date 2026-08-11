/** @module Material */

import { vec4 } from "wgpu-matrix";
import { MergeObjects, GetGPUColorValue } from "#/utils";

/**
 * @abstract
 */
export class Material
{
    /** @type {string} */ #Label;
    /** @type {Renderer} */ #Renderer;
    /** @type {RenderPipeline} */ #Pipeline;

    /** @typedef {import("wgpu-matrix").Vec4} Vec4 */
    /** @type {GPUBuffer | undefined} */ #ColorBuffer;
    /** @type {Vec4} */ #Color = vec4.create(1, 1, 1, 1);

    /** @typedef {import("#/stages/RenderStage").RenderPipelineDescriptor} RenderPipelineDescriptor */

    /**
     * @param {Renderer} Renderer
     * @param {string} [label = "Material"]
     */
    constructor(Renderer, label = "Material")
    {
        this.#Pipeline = new Renderer.Pipeline(label);
        this.#Renderer = Renderer;
        this.#Label = label;
    }

    #UpdateColorBuffer()
    {
        this.#ColorBuffer && this.#Pipeline.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#ColorBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Color)
        );
    }

    /**
     * @protected
     * @param {RenderPipelineDescriptor} pipelineDescriptor
     * @param {RenderPipelineDescriptor} [materialDescriptor]
     */
    async CreatePipeline(pipelineDescriptor, materialDescriptor)
    {
        this.#ColorBuffer = this.#Pipeline.CreateUniformBuffer(
            "color", { label: `${this.#Label} Color Buffer` }
        ).buffer;

        this.#UpdateColorBuffer();
        pipelineDescriptor.label ??= this.#Label;
        MergeObjects(pipelineDescriptor, materialDescriptor);
        await this.#Renderer.AddPipeline(this.#Pipeline, pipelineDescriptor);

        return this.#ColorBuffer;
    }

    /**
     * @param {import("../utils/Color").ColorParam} color - Wireframe color.
     */
    set Color(color)
    {
        this.#Color.set(GetGPUColorValue(color));
        this.#UpdateColorBuffer();
    }

    /**
     * @returns {Vec4} The color of the wireframe.
     */
    get Color()
    {
        return this.#Color;
    }

    get Pipeline()
    {
        return this.#Pipeline;
    }

    Destroy()
    {
        this.#Renderer.RemovePipeline(this.#Pipeline);
        this.#ColorBuffer = this.#ColorBuffer?.destroy();
    }
}
