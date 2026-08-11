/** @module WireframeMaterial */

import { Material } from "./Material";
import { Mesh as MeshShader } from "#/shaders";
import { BLEND_STATE, BINDINGS } from "#/pipelines/Constants";

export class WireframeMaterial extends Material
{
    /** @type {GPUShaderModule} */ #ShaderModule;

    /** @type {(GPUBuffer | undefined)[]} */ #Resources = [void 0, void 0, void 0];
    #Bindings = [BINDINGS.MESH_MATRIX, BINDINGS.MESH_COLOR, BINDINGS.CAMERA_MATRIX];

    /**
     * @param {Renderer} Renderer
     * @param {string} [label = "WireframeMaterial"]
     */
    constructor(Renderer, label = "WireframeMaterial")
    {
        super(Renderer, label);

        this.#ShaderModule = this.Pipeline.CreateShaderModule(MeshShader);
    }

    /**
     * @param {import("../stages/RenderStage").RenderPipelineDescriptor} [materialDescriptor]
     */
    async AddPipeline(materialDescriptor)
    {
        const Pipeline = this.Pipeline;

        this.#Resources[1] = await this.CreatePipeline(
        {
            multisample: Pipeline.CreateMultisampleState(),
            depthStencil: Pipeline.CreateDepthStencilState(),
            primitive: Pipeline.CreatePrimitiveState("line-list"),
            vertex: Pipeline.CreateVertexState(this.#ShaderModule),
            fragment: Pipeline.CreateFragmentState(this.#ShaderModule, void 0,
                Pipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
            )
        }, materialDescriptor);

        return Pipeline;
    }

    /**
     * @param {GPUBuffer} cameraBuffer - Camera buffer.
     */
    set CameraMatrixBuffer(cameraBuffer)
    {
        this.#Resources[2] = cameraBuffer;
    }

    /**
     * @param {GPUBuffer} meshBuffer - Mesh buffer.
     */
    set MeshMatrixBuffer(meshBuffer)
    {
        this.#Resources[0] = meshBuffer;
    }

    get Resources()
    {
        return this.#Resources;
    }

    get Bindings()
    {
        return this.#Bindings;
    }

    /**
     * @override
     */
    Destroy()
    {
        super.Destroy();
        this.#Resources.splice(0);
    }
}
