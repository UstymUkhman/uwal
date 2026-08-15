/** @module WireframeMaterial */

import { Material } from "./Material";
import { Mesh as MeshShader } from "#/shaders";
import { BLEND_STATE } from "#/pipelines/Constants";

export class WireframeMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;

    /** @typedef {import("../pipelines/Pipeline").ShaderModuleDescriptor} ShaderModuleDescriptor */

    /**
     * @param {Renderer} Renderer
     * @param {string} [label = "WireframeMaterial"]
     * @param {ShaderModuleDescriptor | string} [shader]
     */
    constructor(Renderer, label, shader)
    {
        const { pipelineLabel, shader: code, label: shaderLabel, hints } =
            /** @type {ShaderModuleDescriptor} */ (shader ?? {});

        super(Renderer, label || pipelineLabel || "WireframeMaterial");

        const shaderCode = typeof shader === "string" && shader || code || MeshShader;

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
            vertex: this.Pipeline.CreateVertexState(this.#ShaderModule),
            fragment: this.Pipeline.CreateFragmentState(this.#ShaderModule, void 0,
                this.Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
            )
        }, materialDescriptor);
    }
}
