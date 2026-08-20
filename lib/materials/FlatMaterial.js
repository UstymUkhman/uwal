/** @module FlatMaterial */

import { ColorMap } from "#/shaders";
import { Material } from "./Material";

export class FlatMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;
    /** @type {FlatMaterialOptions} */ FlatOptions = this.Options;
    /** @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline" */
    /** @typedef {import("./Material").MaterialOptions & Partial<Record<"colorMap", boolean>>} FlatMaterialOptions */

    /**
     * @param {Renderer} Renderer
     * @param {FlatMaterialOptions} [options]
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {string} [label = "FlatMaterial"]
     */
    constructor(Renderer, options, shader, label)
    {
        const { pipelineLabel, label: shaderLabel, hints } =
            /** @type {ShaderModuleDescriptor} */ (shader ?? {});

        super(Renderer, options, label || pipelineLabel || "FlatMaterial");

        const shaderCode = this.GetShaderCode(shader);

        this.#ShaderModule = this.Pipeline.CreateShaderModule(shaderCode, shaderLabel, hints);
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
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     */
    GetShaderCode(shader)
    {
        return super.GetShaderCode(shader, this.FlatOptions.colorMap && ColorMap || void 0);
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
