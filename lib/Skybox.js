import { MergeObjects } from "#/utils";
import { ERROR, ThrowError } from "#/Errors";
import { Skybox as SkyboxShader } from "#/shaders";

/**
 * Use a cube texture to be rendered as a scene background.
 * @see [Skybox / Materials](https://ustymukhman.github.io/uwal/dist/examples/examples.html#skybox-materials)
 * and [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) for reference.
 */
export class Skybox
{
    /** @type {string} */ #Label;
    /** @type {Renderer} */ #Renderer;
    /** @type {RenderPipeline} */ #Pipeline;

    /** @type {Float32Array<ArrayBuffer>} */ #Origin = new Float32Array(3);
    /** @type {InverseViewProjection | undefined} */ #InverseViewProjection;

    /**
     * @import {Camera3D} from "#/cameras/Camera3D"
     * @import {RenderPipelineDescriptor} from "#/stages/RenderStage"
     * @typedef {{ Matrix: Float32Array<ArrayBuffer>, buffer: GPUBuffer }} InverseViewProjection
     */

    /**
     * Camera instance to view the skybox. Usually, it should be the same as [Scene.MainCamera](./Scene#maincamera).
     *
     * @type {Camera3D}
     */
    Camera;

    /**
     * Whether to update the `ViewProjectionMatrix` before inverting it.
     * @see [Camera3D.GetInverseViewProjectionMatrix](./Camera3D#getinverseviewprojectionmatrix) for reference.
     *
     * @type {boolean}
     */
    UpdateViewProjectionMatrix = false;

    /**
     * @param {Renderer} Renderer - `Renderer` instance to create the pipeline.
     * @param {Camera3D} Camera - Camera instance to view the skybox.
     * @param {string} [label = "Skybox"] - Skybox name.
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
     * Create an internal render pipeline to draw the skybox.
     *
     * @param {RenderPipelineDescriptor} [pipelineDescriptor] - Optional pipeline descriptor.
     */
    async CreatePipeline(pipelineDescriptor = {})
    {
        const module = this.#Pipeline.CreateShaderModule(SkyboxShader);

        this.#InverseViewProjection = /** @type {InverseViewProjection} */ (this.#Pipeline.CreateUniformBuffer(
            "Matrix", { label: `${this.#Label} Inverse View-Projection Matrix Buffer` }
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
     * Set a cube texture and a sampler to use for the skybox.
     * @throws `ERROR.INVERSE_VIEW_PROJECTION_MATRIX_NOT_FOUND` if called before [CreatePipeline](#createpipeline).
     *
     * @param {GPUTexture} texture - Cube texture to use for the skybox.
     * @param {GPUSampler} sampler - Sampler to use for the cube texture.
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
     * Get the camera's view-projection matrix, update its buffer, and draw the skybox using an internal pipeline.
     * @throws `ERROR.INVERSE_VIEW_PROJECTION_MATRIX_NOT_FOUND` if called before [CreatePipeline](#createpipeline).
     *
     * @param {boolean} [submit = false] - Whether to destroy the render pass and submit the command buffer.
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

    /**
     * Destroy and remove the render pipeline, the inverse view-projection buffer, and reset the internal state.
     */
    Destroy()
    {
        this.#Pipeline.Destroy();
        this.UpdateViewProjectionMatrix = false;
        this.#Renderer.RemovePipeline(this.#Pipeline);
        this.#InverseViewProjection = this.#InverseViewProjection?.buffer.destroy();
    }
}
