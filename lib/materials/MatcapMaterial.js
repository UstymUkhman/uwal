/** @module MatcapMaterial */

import { MergeObjects } from "#/utils";
import { FlatMaterial } from "./FlatMaterial";
import { MatcapInstance, MatcapVertex, MatcapMap, Matcap } from "#/shaders";

export class MatcapMaterial extends FlatMaterial
{
    /**
     * @typedef {Object} MaterialOptions
     * @property {boolean} [flatShaded]
     * @property {boolean} [normalMap]
     * @property {boolean} [instanced]
     *
     * @import {ShaderModuleDescriptor, ShaderCode} from "../pipelines/Pipeline"
     * @typedef {import("./FlatMaterial").FlatMaterialOptions & MaterialOptions} MatcapMaterialOptions
     */

    /** @type {MatcapMaterialOptions} */ MatcapOptions;

    /**
     * @param {Renderer} Renderer
     * @param {MatcapMaterialOptions} [options]
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {string} [label = "MatcapMaterial"]
     */
    constructor(Renderer, options = {}, shader, label)
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
        return this.MatcapOptions?.normalMap && "vertexNormalUV"
            || super.GetVertexEntry().replace("vertex", "vertexNormal");
    }

    /**
     * @override
     * @protected
     */
    GetFragmentEntry()
    {
        const entry = super.GetFragmentEntry();

        return this.MatcapOptions?.normalMap && entry === "fragment"
            && "fragmentMatcapUV" || entry.replace("fragment", "fragmentMatcap");
    }

    /**
     * @override
     * @protected
     * @param {ShaderModuleDescriptor | ShaderCode} [shader]
     * @param {MatcapMaterialOptions} [options]
     */
    GetShaderCode(shader, options)
    {
        const vertex = options?.instanced && MatcapInstance || MatcapVertex;
        const fragment = options?.colorMap && MatcapMap || Matcap;
        return super.GetShaderCode(shader, options, [vertex, fragment]);
    }

    /**
     * @override
     * @param {import("../stages/RenderStage").RenderPipelineDescriptor} [materialDescriptor]
     */
    async AddPipeline(materialDescriptor)
    {
        const { flatShaded, normalMap } = this.MatcapOptions;

        return super.AddPipeline(
            MergeObjects(materialDescriptor ?? {}, /** @type {GPUFragmentState} */ ( /** @type {unknown} */ ({
                fragment: { constants: { USE_FLAT_SHADED: !!flatShaded, USE_NORMAL_MAP: !!normalMap } }
            })))
        );
    }
}
