/** @module FlatMaterial */

import { ColorMap } from "#/shaders";
import { Material } from "./Material";

/**
 * @import {ShaderCode} from "../pipelines/Pipeline"
 * @typedef {import("./Material").MaterialOptions & Partial<Record<"colorMap", boolean>>} FlatMaterialOptions
 * @exports FlatMaterialOptions
 */

export class FlatMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;
    /** @type {FlatMaterialOptions} */ FlatOptions = this.Options;

    /**
     * @param {Renderer} Renderer
     * @param {FlatMaterialOptions | ShaderCode} [options]
     * @param {string} [label = "FlatMaterial"]
     */
    constructor(Renderer, options = {}, label)
    {
        super(Renderer, options, label || "FlatMaterial");

        const { label: shaderLabel, hints } =
            /** @type {import("#/pipelines/Pipeline").ShaderModuleDescriptor} */ (this.Options.shader ?? {});

        this.#ShaderModule = this.Pipeline.CreateShaderModule(this.GetShaderCode(options), shaderLabel, hints);
    }

    /**
     * @override
     * @protected
     */
    GetVertexEntry()
    {
        return this.FlatOptions.colorMap && "vertexUV" || super.GetVertexEntry();
    }

    /**
     * @override
     * @protected
     */
    GetFragmentEntry()
    {
        return this.FlatOptions.colorMap && "fragmentMap" || super.GetFragmentEntry();
    }

    /**
     * @override
     * @protected
     * @param {FlatMaterialOptions | ShaderCode} [options]
     * @param {(string | undefined)[]} [defaultShaders]
     */
    GetShaderCode(options, defaultShaders = [])
    {
        if (this.FlatOptions.colorMap && !defaultShaders[1])
        {
            defaultShaders[1] = ColorMap;
        }

        return super.GetShaderCode(options, defaultShaders);
    }

    /**
     * @param {import("../stages/RenderStage").RenderPipelineDescriptor} [materialDescriptor]
     */
    async AddPipeline(materialDescriptor)
    {
        return await this.CreatePipeline(
        {
            vertex: this.Pipeline.CreateVertexState(this.#ShaderModule, this.GetVertexEntry()),
            fragment: this.Pipeline.CreateFragmentState(this.#ShaderModule, this.GetFragmentEntry())
        }, materialDescriptor);
    }
}
