/** @module MatcapMaterial */

import { MergeObjects } from "#/utils";
import { FlatMaterial } from "./FlatMaterial";
import { Matcap, MatcapMap } from "#/shaders";

export class MatcapMaterial extends FlatMaterial
{
    /**
     * @typedef {Object} MaterialOptions
     * @property {boolean} [flatShaded]
     * @property {boolean} matcapMap
     *
     * @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline"
     * @typedef {import("./FlatMaterial").FlatMaterialOptions & MaterialOptions} MatcapMaterialOptions
     */

    /** @type {MatcapMaterialOptions} */ MatcapOptions;

    /**
     * @param {Renderer} Renderer
     * @param {MatcapMaterialOptions} options
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {string} [label = "MatcapMaterial"]
     */
    constructor(Renderer, options, shader, label)
    {
        const { pipelineLabel } = /** @type {ShaderModuleDescriptor} */ (shader ?? {});

        super(Renderer, options, shader, label || pipelineLabel || "MatcapMaterial");

        this.MatcapOptions = options;
    }

    /**
     * @override
     * @protected
     */
    GetVertexEntry()
    {
        return "vertexNormalUV";
    }

    /**
     * @override
     * @protected
     */
    GetFragmentEntry()
    {
        const fragment = super.GetFragmentEntry();
        return (fragment === "fragment" && "fragmentUV" || fragment).replace("fragment", "fragmentNormal");
    }

    /**
     * @override
     * @protected
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {MatcapMaterialOptions} [options]
     */
    GetShaderCode(shader, options)
    {
        const matcap = options?.colorMap && MatcapMap || Matcap;
        return super.GetShaderCode(shader, options, matcap);
    }

    /**
     * @override
     * @param {import("../stages/RenderStage").RenderPipelineDescriptor} [materialDescriptor]
     */
    async AddPipeline(materialDescriptor)
    {
        this.MatcapOptions?.flatShaded && MergeObjects(materialDescriptor ?? {}, /** @type {GPUFragmentState} */ (
            /** @type {unknown} */ ({ fragment: { constants: { FLAT_SHADED: 1 } } }))
        );

        return super.AddPipeline(materialDescriptor);
    }
}
