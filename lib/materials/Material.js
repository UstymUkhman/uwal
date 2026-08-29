/** @module Material */

import { vec3, vec4 } from "wgpu-matrix";
import { MeshVertex, Emissive, Color } from "#/shaders";
import { MergeObjects, GetGPUColorValue } from "#/utils";

/**
 * @typedef {Readonly<{ NONE: 0, COLOR: 1, MAP: 2 }>} Emission
 *
 * @typedef {Object} MaterialOptions
 * @property {Emission[keyof Emission]} [emission]
 *
 * @exports MaterialOptions
 */

/**
 * @abstract
 * @noInheritDoc
 */
export class Material
{
    /** @type {string} */ #Label;
    /** @type {Renderer} */ #Renderer;
    /** @type {MaterialOptions} */ Options;
    /** @type {RenderPipeline} */ #Pipeline;

    /** @type {GPUBuffer | undefined} */ #ColorBuffer;
    /** @type {Vec4} */ #Color = vec4.create(1, 1, 1, 1);
    /** @type {GPUBuffer | undefined} */ #EmissiveBuffer;
    /** @type {Vec4} */ #Emissive = vec4.create(0, 0, 0, 1);

    /**
     * @import {Vec4} from "wgpu-matrix"
     * @import {ColorParam} from "#/utils/Color"
     * @import {RenderPipelineDescriptor} from "#/stages/RenderStage"
     * @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline"
     */

    /**
     * @param {Renderer} Renderer
     * @param {MaterialOptions} options
     * @param {string} [label = "Material"]
     */
    constructor(Renderer, options, label = "Material")
    {
        this.#Pipeline = new Renderer.Pipeline(label);
        this.#Renderer = Renderer;
        this.Options = options;
        this.#Label = label;
    }

    #UpdateColorBuffer()
    {
        this.#ColorBuffer && this.#Pipeline.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#ColorBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Color)
        );
    }

    #CreateEmissiveBuffer()
    {
        return this.#EmissiveBuffer ??= this.#Pipeline.CreateUniformBuffer(
            "emissiveColor", { label: `${this.#Label} Emissive Color Buffer` }
        ).buffer;
    }

    #UpdateEmissiveBuffer()
    {
        this.#Pipeline.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#EmissiveBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Emissive)
        );
    }

    /**
     * @protected
     * @returns {string}
     */
    GetVertexEntry()
    {
        const emission = this.Options?.emission || 0;
        return emission === 2 && "vertexUV" || "vertex";
    }

    /**
     * @protected
     * @returns {string}
     */
    GetFragmentEntry()
    {
        const emission = this.Options?.emission || 0;
        return emission === 2 && "fragmentUV" || "fragment";
    }

    /**
     * @protected
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {MaterialOptions} [_options]
     * @param {string} [defaultFragment = Color]
     */
    GetShaderCode(shader, _options, defaultFragment = Color)
    {
        const emission = this.Options?.emission || 0;

        const Shader = typeof shader === "string" && shader
            || (/** @type {ShaderModuleDescriptor} */ (shader ?? {}))?.shader || [];

        const EmissiveShader = emission === 2 && Emissive.Map || emission && Emissive.Color || Emissive.None;

        if (Array.isArray(Shader))
        {
            const [Vertex = MeshVertex, Fragment = defaultFragment] = Shader;
            return `${Vertex}\n\n${EmissiveShader}\n\n${Fragment}`;
        }

         return `${Shader}\n\n${EmissiveShader}`;
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
        return await this.#Renderer.AddPipeline(this.#Pipeline, pipelineDescriptor);
    }

    get Pipeline()
    {
        return this.#Pipeline;
    }

    /**
     * @param {ColorParam} color - Material color.
     */
    set Color(color)
    {
        this.#Color.set(GetGPUColorValue(color));
        this.#UpdateColorBuffer();
    }

    /**
     * @returns {Vec4} The color of the material.
     */
    get Color()
    {
        return this.#Color;
    }

    /**
     * @returns {GPUBuffer | undefined} Color buffer created by the [CreatePipeline](#createpipeline) method.
     */
    get ColorBuffer()
    {
        return this.#ColorBuffer;
    }

    /**
     * @param {ColorParam} color - Emissive color.
     */
    set Emissive(color)
    {
        this.#CreateEmissiveBuffer();
        const [r, g, b] = GetGPUColorValue(color);
        this.#Emissive.set([r, g, b]);
        this.#UpdateEmissiveBuffer();
    }

    /**
     * @returns {Vec4} Emitted color.
     */
    get Emissive()
    {
        return vec3.copy(this.#Emissive);
    }

    /**
     * @param {number} intensity - Emissive intensity.
     */
    set EmissiveIntensity(intensity)
    {
        this.#CreateEmissiveBuffer();
        this.#Emissive[3] = intensity;
        this.#UpdateEmissiveBuffer();
    }

    get EmissiveIntensity()
    {
        return this.#Emissive[3];
    }

    /**
     * @returns {GPUBuffer | undefined} Color buffer created by the [CreatePipeline](#createpipeline) method.
     */
    get EmissiveBuffer()
    {
        return this.#EmissiveBuffer;
    }

    Destroy()
    {
        if (this.#Pipeline)
        {
            this.#Pipeline.Destroy();
            this.#Renderer.RemovePipeline(this.#Pipeline);
        }

        this.#EmissiveBuffer = this.#EmissiveBuffer?.destroy();
        this.#ColorBuffer = this.#ColorBuffer?.destroy();
    }
}
