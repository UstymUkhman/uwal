/** @module WireframeMaterial */

import { Material } from "./Material";
import { BLEND_STATE } from "#/pipelines/Constants";

export class WireframeMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;

    /** @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline" */

    /**
     * @param {Renderer} Renderer
     * @param {import("./Material").MaterialOptions} [options]
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {string} [label = "WireframeMaterial"]
     */
    constructor(Renderer, options, shader, label)
    {
        const { pipelineLabel, label: shaderLabel, hints } =
            /** @type {ShaderModuleDescriptor} */ (shader ?? {});

        super(Renderer, options, label || pipelineLabel || "WireframeMaterial");

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
            depthStencil: this.Pipeline.CreateDepthStencilState(),
            primitive: this.Pipeline.CreatePrimitiveState("line-list"),
            vertex: this.Pipeline.CreateVertexState(this.#ShaderModule, this.GetVertexEntry()),
            fragment: this.Pipeline.CreateFragmentState(this.#ShaderModule, this.GetFragmentEntry(),
                this.Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
            )
        }, materialDescriptor);
    }
}
