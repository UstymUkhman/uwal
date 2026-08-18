/** @module FlatMaterial */

import { Material } from "./Material";

export class FlatMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;

    /** @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline" */

    /**
     * @param {Renderer} Renderer
     * @param {import("./Material").MaterialOptions} [options]
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
