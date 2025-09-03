import { Texture } from "#/textures";
import { BaseStage } from "#/stages";
import { RenderPipeline } from "#/pipelines";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { CreateBuffer, GetGPUColorValue, GetParamArray, WriteBuffer, GetShaderModule } from "#/utils";

/**
 * @typedef {ShaderCode | GPUShaderModule | ShaderModuleDescriptor | RenderPipelineDescriptor & {
       pipelineName?: string;
 * }} NewRenderPipelineDescriptor
 * @exports NewRenderPipelineDescriptor
 */

export default class RenderStage extends BaseStage
{
    /**
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineDescriptor} RenderPipelineDescriptor
     * @typedef {import("../pipelines/BasePipeline").ShaderModuleDescriptor} ShaderModuleDescriptor
     * @typedef {import("../Device").ConfigurationOptions} ConfigurationOptions
     * @typedef {import("../pipelines/BasePipeline").ShaderCode} ShaderCode
     */

    /**
     * @typedef {Object} IndexBufferParams
     * @property {GPUBuffer} buffer
     * @property {GPUIndexFormat} format
     * @property {GPUSize64} offset
     * @property {GPUSize64} size
     */

    #Resolution = new Float32Array(3);
    #UseDepthStencilAttachment = false;

    /** @type {HTMLCanvasElement} */ #Canvas;
    /** @type {GPUCanvasContext} */ #Context;

    /** @type {GPUBuffer} */ #ResolutionBuffer;
    /** @type {Texture | undefined} */ #Texture;

    /** @type {number | undefined} */ #DPR = void 0;
    /** @type {GPURenderPassDescriptor} */ #Descriptor;
    /** @type {GPUTexture | undefined} */ #DepthTexture;

    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPUTexture | undefined} */ #MultisampleTexture;
    /** @type {GPURenderPassEncoder | undefined} */ #RenderPass;

    /**
     * @param {GPUDevice} device
     * @param {string} [name = ""]
     * @param {HTMLCanvasElement} [canvas]
     * @param {ConfigurationOptions} [options = {}]
     */
    constructor(device, name, canvas, options)
    {
        super(device, "Render", name);
        !canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const context = canvas.getContext("webgpu");
        !context && ThrowError(ERROR.CONTEXT_NOT_FOUND);

        context.configure(/** @type {GPUCanvasConfiguration} */ ({ device, ...options }));

        this.#ResolutionBuffer = CreateBuffer(this.Device, {
            size: this.#Resolution.length * Float32Array.BYTES_PER_ELEMENT,
            label: "Render Pipeline Resolution Buffer",
            usage: USAGE.UNIFORM
        });

        this.#Canvas = canvas;
        this.#Context = context;

        this.#UpdateCanvasResolution();
        this.#PreferredCanvasFormat = options.format;
        this.CreatePassDescriptor(this.CreateColorAttachment());
    }

    /** @param {ConfigurationOptions} options */
    ConfigureContext(options)
    {
        const format = options.format ?? this.#PreferredCanvasFormat;
        this.#Context.configure({ device: this.Device, format, ...options });
    }

    /**
     * @param {import("../Color").ColorParam} [clearColor]
     * @param {GPUTextureView} [view]
     * @param {GPULoadOp} [loadOp = "clear"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {GPUTextureView} [resolveTarget]
     * @param {GPUIntegerCoordinate} [depthSlice]
     */
    CreateColorAttachment(clearColor, view, loadOp = "clear", storeOp = "store", resolveTarget, depthSlice)
    {
        const clearValue = clearColor && GetGPUColorValue(clearColor);
        return { view, loadOp, storeOp, clearValue, resolveTarget, depthSlice };
    }

    /**
     * @typedef {Object} StencilAttachment
     * @property {GPUStencilValue} stencilClearValue
     * @property {GPULoadOp} stencilLoadOp
     * @property {GPUStoreOp} stencilStoreOp
     * @property {boolean} [stencilReadOnly]
     *
     * @param {GPUStencilValue} [stencilClearValue = 0]
     * @param {GPULoadOp} [stencilLoadOp = "clear"]
     * @param {GPUStoreOp} [stencilStoreOp = "store"]
     * @param {boolean} [stencilReadOnly]
     *
     * @returns {StencilAttachment}
     */
    CreateStencilAttachment(stencilClearValue = 0, stencilLoadOp = "clear", stencilStoreOp = "store", stencilReadOnly)
    {
        return { stencilClearValue, stencilLoadOp, stencilStoreOp, stencilReadOnly };
    }

    /**
     * @param {GPUTextureView} [view]
     * @param {number} [depthClearValue = 1]
     * @param {GPULoadOp} [depthLoadOp = "clear"]
     * @param {GPUStoreOp} [depthStoreOp = "store"]
     * @param {boolean} [depthReadOnly]
     * @param {StencilAttachment} [stencilAttachment]
     */
    CreateDepthStencilAttachment(
        view,
        depthClearValue = 1,
        depthLoadOp = "clear",
        depthStoreOp = "store",
        depthReadOnly,
        stencilAttachment
    ) {
        this.#UseDepthStencilAttachment = true;
        this.#Texture = new Texture(this.Device);

        return { view, depthClearValue, depthLoadOp, depthStoreOp, depthReadOnly, ...stencilAttachment };
    }

    #UpdateDepthStencilAttachment()
    {
        const currentTexture = this.CurrentTexture;
        const { width, height } = currentTexture;

        // A new depth texture needs to be created if absent or if its size is different from current canvas texture:
        if (!this.#DepthTexture || this.#DepthTexture.width !== width || this.#DepthTexture.height !== height)
        {
            this.#DepthTexture?.destroy();

            this.#DepthTexture = this.#Texture.CreateTextureFromSource(currentTexture,
            {
                sampleCount: this.#MultisampleTexture?.sampleCount ?? 1,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                label: "Depth Texture",
                format: "depth24plus",
                mipmaps: false
            });
        }

        /** @type {GPURenderPassDescriptor} */ (this.#Descriptor)
            .depthStencilAttachment.view = this.#DepthTexture.createView();
    }

    /**
     * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment]
     * @param {string} [label]
     * @param {GPUQuerySet} [occlusionQuerySet]
     * @param {GPURenderPassTimestampWrites} [timestampWrites]
     * @param {GPUSize64} [maxDrawCount]
     */
    CreatePassDescriptor(
        colorAttachments, depthStencilAttachment, label, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        const attachments = /** @type {GPURenderPassColorAttachment[]} */ (GetParamArray(colorAttachments));
        label ??= this.CreateStageLabel("Render Pass");

        return this.#Descriptor =
        {
            colorAttachments: attachments,
            depthStencilAttachment,
            occlusionQuerySet,
            timestampWrites,
            maxDrawCount,
            label
        };
    }

    /**
     * @override
     * @param {GPUTextureFormat} [format]
     * @param {GPUStorageTextureAccess} [access]
     * @param {GPUTextureViewDimension} [viewDimension]
     * @param {GPUShaderStageFlags} [visibility]
     * @param {GPUIndex32} [binding]
     */
    CreateStorageTextureBindingLayout(format = this.#PreferredCanvasFormat, access, viewDimension, visibility, binding)
    {
        return { binding, visibility: GPUShaderStage.FRAGMENT, storageTexture: { access, format, viewDimension } };
    }

    /**
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    /*#__INLINE__*/ #CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return { format, shaderLocation, offset };
    }

    /*#__INLINE__*/ #UpdateCanvasResolution()
    {
        this.#Resolution.set([this.#Canvas.width, this.#Canvas.height, this.DevicePixelRatio]);
        WriteBuffer(this.Device.queue, this.#ResolutionBuffer, this.#Resolution);
    }

    /**
     * @param {number} width
     * @param {number} height
     * @param {boolean} [updateStyle = true]
     */
    SetCanvasSize(width, height, updateStyle = true)
    {
        !this.Device && ThrowError(ERROR.DEVICE_NOT_FOUND);
        !this.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        let scaledWidth = this.DevicePixelRatio * width | 0;
        let scaledHeight = this.DevicePixelRatio * height | 0;

        const maxSize = this.Device.limits.maxTextureDimension2D;

        scaledWidth = Math.max(1, Math.min(scaledWidth, maxSize));
        scaledHeight = Math.max(1, Math.min(scaledHeight, maxSize));

        if (this.#Canvas.width !== scaledWidth || this.#Canvas.height !== scaledHeight)
        {
            this.#Canvas.height = scaledHeight;
            this.#Canvas.width = scaledWidth;
            this.#UpdateCanvasResolution();

            if (updateStyle)
            {
                this.#Canvas.style.width = `${width}px`;
                this.#Canvas.style.height = `${height}px`;
            }
        }
    }

    /**
     * @param {NewRenderPipelineDescriptor} moduleDescriptor
     * @param {boolean} [useInRenderPass] - Call immediately `GPURenderCommandsMixin.setPipeline()` with this
     * `Pipeline` to use it in an already created `GPURenderPassEncoder`. Throws a `RENDER_PASS_NOT_FOUND` warning if
     * there's no such active and recording `GPURenderPassEncoder`.
     */
    async CreatePipeline(moduleDescriptor, useInRenderPass)
    {
        const shaderModule = Array.isArray(moduleDescriptor) || typeof moduleDescriptor === "string";
        const shaderModuleDescriptor = shaderModule || "shader" in moduleDescriptor;
        const Pipeline = new this.Pipeline(moduleDescriptor.pipelineName);

        moduleDescriptor = GetShaderModule(moduleDescriptor) ?? (shaderModuleDescriptor && Pipeline.CreateShaderModule(
            ...Object.values(shaderModule && [moduleDescriptor] || moduleDescriptor)
        ) || moduleDescriptor);

        return await this.AddPipeline(Pipeline, moduleDescriptor, useInRenderPass);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {GPUShaderModule | RenderPipelineDescriptor} [moduleDescriptor]
     * @param {boolean} [useInRenderPass] - Call immediately `GPURenderCommandsMixin.setPipeline()` with this
     * `Pipeline` to use it in an already created `GPURenderPassEncoder`. Throws a `RENDER_PASS_NOT_FOUND` warning if
     * there's no such active and recording `GPURenderPassEncoder`.
     */
    async AddPipeline(Pipeline, moduleDescriptor, useInRenderPass)
    {
        const pipeline = await Pipeline.Init(moduleDescriptor);

        if (useInRenderPass) this.#RenderPass
            ? this.#RenderPass.setPipeline(pipeline)
            : ThrowWarning(ERROR.RENDER_PASS_NOT_FOUND);

        // Prevent resetting an already stored pipeline:
        Reflect.deleteProperty(Pipeline, "Init");

        this.Pipelines.push(Pipeline);
        return Pipeline;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {boolean} submit
     * @param {boolean} set
     */
    #UsePipeline(Pipeline, submit, set)
    {
        const setPipeline = set || !this.#RenderPass;

        if (!this.#RenderPass)
        {
            let colorAttachmentSubresource = 'view';
            const colorAttachment = this.#Descriptor.colorAttachments[Pipeline.ColorAttachment];

            if (this.#MultisampleTexture)
            {
                colorAttachmentSubresource = 'resolveTarget';
                colorAttachment.view = this.#MultisampleTexture.createView();
            }

            colorAttachment[colorAttachmentSubresource] = Pipeline.TextureView || this.CurrentTextureView;

            this.#RenderPass = this.GetCommandEncoder().beginRenderPass(this.#Descriptor);
        }

        setPipeline && this.#RenderPass.setPipeline(Pipeline.GPUPipeline);

        Pipeline.UseRenderBuffers(this.#RenderPass);

        Pipeline.UseBindGroups(this.#RenderPass);

        this.#RenderPass.setBlendConstant(Pipeline.BlendConstant);

        this.#RenderPass[Pipeline.DrawMethod](...Pipeline.DrawParams);

        // End & destroy render pass without submitting command buffer:
        Pipeline.DestroyPassEncoder && !submit && this.DestroyRenderPass();
    }

    /**
     * @param {boolean} [submit = true] - Complete recording of the render pass commands sequence
     * (`GPURenderPassEncoder.end()`), complete recording of the commands sequence (`GPUCommandEncoder.finish()`),
     * schedule the execution of the command buffers by the GPU on this queue (`GPUQueue.submit()`) and destroy
     * the current `GPURenderPassEncoder` and `GPUCommandEncoder` after the last pipeline's primitives have been drawn.
     */
    Render(submit = true)
    {
        this.#UseDepthStencilAttachment && this.#UpdateDepthStencilAttachment();

        const pl = this.Pipelines.length;

        if (!(pl - 1) && this.Pipelines[0].Active)
        {
            // Save some instructions if there's only one active pipeline:
            this.#UsePipeline(this.Pipelines[0], submit, false);
        }
        else
        {
            for (let p = 0; p < pl; ++p)
            {
                const Pipeline = /** @type {RenderPipeline} */ (this.Pipelines[p]);
                Pipeline.Active && this.#UsePipeline(Pipeline, submit, true);
            }
        }

        submit && this.Submit();
    }

    DestroyRenderPass()
    {
        this.#RenderPass?.end();
        this.#RenderPass = undefined;
    }

    Submit()
    {
        this.DestroyRenderPass();
        this.SubmitCommandBuffer();
        this.CommandEncoder = undefined;
    }

    get Canvas()
    {
        return this.#Canvas;
    }

    get Context()
    {
        return this.#Context;
    }

    get RenderPass()
    {
        return this.#RenderPass;
    }

    get DepthTexture()
    {
        return this.#DepthTexture;
    }

    get CurrentTexture()
    {
        return this.#Context.getCurrentTexture();
    }

    get CurrentTextureView()
    {
        return this.CurrentTexture.createView();
    }

    /** @param {GPUTexture | undefined} texture */
    set MultisampleTexture(texture)
    {
        this.#MultisampleTexture = texture;
    }

    get MultisampleTexture()
    {
        return this.#MultisampleTexture;
    }

    /** @param {number} dpr */
    set DevicePixelRatio(dpr)
    {
        this.#DPR = dpr;
    }

    get DevicePixelRatio()
    {
        return this.#DPR ?? globalThis.devicePixelRatio ?? 1;
    }

    get ResolutionBuffer()
    {
        return this.#ResolutionBuffer;
    }

    get BaseCanvasSize()
    {
        const { width, height } = this.#Canvas;
        const pixelRatio = this.DevicePixelRatio;
        return [width / pixelRatio, height / pixelRatio];
    }

    get CanvasSize()
    {
        return [this.#Canvas.width, this.#Canvas.height];
    }

    get AspectRatio()
    {
        !this.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);
        return this.#Canvas.width / this.#Canvas.height;
    }

    /**
     * @typedef {import("../pipelines/RenderPipeline").RenderPipeline} Pipeline
     * @returns {Pipeline & { new(): Pipeline }}
     */
    get Pipeline()
    {
        const { Name, Device } = this;
        const format = this.#PreferredCanvasFormat;

        return class extends RenderPipeline
        {
            constructor(name = Name)
            {
                super(Device, format, name);
            }
        };
    }

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.DestroyRenderPass();
        this.#ResolutionBuffer.destroy();

        this.#DepthTexture = this.#DepthTexture?.destroy();
        this.#Texture = this.#Texture?.Destroy();
        this.#Context.unconfigure();
    }
}
