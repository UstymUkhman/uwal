/** @module WireframeMaterial */

import { Material } from "./Material";
import { BLEND_STATE } from "#/pipelines/Constants";

export class WireframeMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;
    /** @import {ShaderModuleDescriptor} from "../pipelines/Pipeline" */

    /**
     * @param {Renderer} Renderer
     * @param {import("./Material").ShaderOptions} [options]
     * @param {string} [label = "WireframeMaterial"]
     */
    constructor(Renderer, options = {}, label)
    {
        super(Renderer, options, label || "WireframeMaterial");

        const { label: shaderLabel, hints } = /** @type {ShaderModuleDescriptor} */ (this.Options.shader ?? {});

        this.#ShaderModule = this.Pipeline.CreateShaderModule(this.GetShaderCode(), shaderLabel, hints);
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
