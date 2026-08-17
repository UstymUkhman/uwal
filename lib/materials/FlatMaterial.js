/** @module FlatMaterial */

import { Material } from "./Material";
import { Mesh as MeshShader } from "#/shaders";

export class FlatMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;

    /** @typedef {import("../pipelines/Pipeline").ShaderModuleDescriptor} ShaderModuleDescriptor */

    /**
     * @param {Renderer} Renderer
     * @param {string} [label = "FlatMaterial"]
     * @param {ShaderModuleDescriptor | string} [shader]
     */
    constructor(Renderer, label, shader)
    {
        const { pipelineLabel, shader: code, label: shaderLabel, hints } =
            /** @type {ShaderModuleDescriptor} */ (shader ?? {});

        super(Renderer, label || pipelineLabel || "FlatMaterial");

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
            vertex: this.Pipeline.CreateVertexState(this.#ShaderModule),
            fragment: this.Pipeline.CreateFragmentState(this.#ShaderModule)
        }, materialDescriptor);
    }
}
