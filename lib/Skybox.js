import { MergeObjects } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { Skybox as SkyboxShader } from "#/shaders";

export class Skybox
{
    /**
     * @import {Camera3D} from "#/cameras/Camera3D"
     * @import {RenderPipelineDescriptor} from "#/stages/RenderStage"
     * @typedef {{ Matrix: Float32Array<ArrayBuffer>, buffer: GPUBuffer }} InverseViewProjection
     */

    /** @type {InverseViewProjection | undefined} */ #InverseViewProjection;
    /** @type {Float32Array<ArrayBuffer>} */ #Origin = new Float32Array(3);
    /** @type {boolean} */ UpdateViewProjectionMatrix = false;

    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {Renderer} */ #Renderer;
    /** @type {Camera3D} */ Camera;
    /** @type {string} */ #Label;

    /**
     * @param {Renderer} Renderer
     * @param {Camera3D} Camera
     * @param {string} [label = "Skybox"]
     */
    constructor(Renderer, Camera, label = "Skybox")
    {
        this.#Pipeline = new Renderer.Pipeline(label);
        this.#Pipeline.SetDrawParams(3);
        this.#Renderer = Renderer;
        this.Camera = Camera;
        this.#Label = label;
    }

    /**
     * @param {RenderPipelineDescriptor} [pipelineDescriptor]
     */
    async CreatePipeline(pipelineDescriptor = {})
    {
        const module = this.#Pipeline.CreateShaderModule(SkyboxShader);

        this.#InverseViewProjection = /** @type {InverseViewProjection} */ (this.#Pipeline.CreateUniformBuffer(
            "Matrix", { label: `${this.#Label} Inverse View Projection Matrix Buffer` }
        ));

        // Add a default multisample state if the renderer uses a multisample texture, but the pipeline doesn't have one.
        if (this.#Renderer.MultisampleTexture && !Object.hasOwn(pipelineDescriptor, "multisample"))
        {
            MergeObjects(pipelineDescriptor, { multisample: this.#Pipeline.CreateMultisampleState() });
        }

        return await this.#Renderer.AddPipeline(this.#Pipeline, MergeObjects(
        {
            depthStencil: this.#Pipeline.CreateDepthStencilState(void 0, void 0, "less-equal"),
            fragment: this.#Pipeline.CreateFragmentState(module),
            vertex: this.#Pipeline.CreateVertexState(module),
            label: `${this.#Label} Render Pipeline`
        }, pipelineDescriptor));
    }

    /**
     * @param {GPUTexture} texture
     * @param {GPUSampler} sampler
     */
    SetCubeTextureView(texture, sampler)
    {
        !this.#InverseViewProjection && ThrowError(ERROR.INVERSE_VIEW_PROJECTION_MATRIX_NOT_FOUND,
            `\`SetCubeTextureView\` method. Call \`Skybox.CreatePipeline\` method before setting a cube texture view.`
        );

        const view = texture.createView({ dimension: "cube" });

        this.#Pipeline.SetBindGroupFromResources([
            /** @type {InverseViewProjection} */ (this.#InverseViewProjection).buffer, view, sampler
        ]);

        return view;
    }

    /**
     * @param {boolean} [submit = false]
     */
    Render(submit = false)
    {
        !this.#InverseViewProjection && ThrowError(ERROR.INVERSE_VIEW_PROJECTION_MATRIX_NOT_FOUND,
            `\`Render\` method. Call \`Skybox.CreatePipeline\` method before rendering a skybox.`
        );

        const { Matrix, buffer } = /** @type {InverseViewProjection} */ (this.#InverseViewProjection);

        this.Camera.GetInverseViewProjectionMatrix(this.UpdateViewProjectionMatrix, this.#Origin, Matrix);

        this.#Pipeline.WriteBuffer(buffer, Matrix);

        this.#Renderer.Render(submit);
    }

    Destroy()
    {
        this.#Pipeline.Destroy();
        this.UpdateViewProjectionMatrix = false;
        this.#Renderer.RemovePipeline(this.#Pipeline);
        this.#InverseViewProjection = this.#InverseViewProjection?.buffer.destroy();
    }
}
