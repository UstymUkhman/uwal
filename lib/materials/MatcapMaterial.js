/** @module MatcapMaterial */

import { FlatMaterial } from "./FlatMaterial";
import { Matcap, MatcapMap } from "#/shaders";

export class MatcapMaterial extends FlatMaterial
{
    /** @type {MatcapMaterialOptions} */ MatcapOptions = this.FlatOptions;
    /** @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline" */
    /** @typedef {import("./FlatMaterial").FlatMaterialOptions & Partial<Record<"matcapMap", boolean>>} MatcapMaterialOptions */

    /**
     * @param {Renderer} Renderer
     * @param {MatcapMaterialOptions} [options]
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {string} [label = "MatcapMaterial"]
     */
    constructor(Renderer, options, shader, label)
    {
        const { pipelineLabel } = /** @type {ShaderModuleDescriptor} */ (shader ?? {});

        super(Renderer, options, shader, label || pipelineLabel || "MatcapMaterial");
    }

    /**
     * @override
     * @protected
     */
    GetVertexEntry()
    {
        return super.GetVertexEntry().replace("vertex", "vertexNormal");
    }

    /**
     * @override
     * @protected
     */
    GetFragmentEntry()
    {
        return super.GetFragmentEntry().replace("fragment", "fragmentNormal");
    }

    /**
     * @override
     * @protected
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {MatcapMaterialOptions} [options]
     */
    GetShaderCode(shader, options)
    {
        return super.GetShaderCode(shader, options, (this.MatcapOptions ?? options).matcapMap && MatcapMap || Matcap);
    }
}
