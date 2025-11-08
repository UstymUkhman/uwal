// @ts-nocheck

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
     * @typedef {import("../primitives").Mesh} Mesh
     * @typedef {import("../geometries").Mesh} MeshGeometry
     * @typedef {import("../materials").Color | undefined} ColorMaterial
     * @typedef {{ Geometry: MeshGeometry, Material: ColorMaterial, Meshes: Mesh[] }} Batch
     *
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineDescriptor} RenderPipelineDescriptor
     * @typedef {import("../pipelines/BasePipeline").ShaderModuleDescriptor} ShaderModuleDescriptor
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineInstance} Pipeline
     * @typedef {import("../Device").ConfigurationOptions} ConfigurationOptions
     * @typedef {import("../pipelines/BasePipeline").ShaderCode} ShaderCode
     */

    #Resolution = new Float32Array(3);
    UseDepthStencilAttachment = false;

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

    /** @type {Map<string, Batch>} */ #OpaqueBatches = new Map();
    /** @type {import("../primitives").Node[]} */ #OpaqueMeshes = [];
    /** @type {Map<string, Batch>} */ #TransparentBatches = new Map();
    /** @type {import("../primitives").Node[]} */ #TransparentMeshes = [];

    #BatchState = { Pipeline: void 0, Index: -1, Geometry: "", Material: "" };

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
     * @param {import("../utils/Color").ColorParam} [clearColor]
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
     * @param {GPUTexture | GPUTextureView} [view]
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
        this.UseDepthStencilAttachment = true;
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
     * @param {GPUTextureFormat | GPUTextureFormat[]} [colorFormats = this.#PreferredCanvasFormat]
     * @param {GPUTextureFormat} [depthStencilFormat = "depth24plus"]
     * @param {GPUIndex32} [label]
     * @param {GPUSize32} [sampleCount]
     * @param {boolean} [depthReadOnly]
     * @param {boolean} [stencilReadOnly]
     */
    CreateRenderBundleEncoder(
        colorFormats = this.#PreferredCanvasFormat,
        depthStencilFormat = "depth24plus",
        label,
        sampleCount,
        depthReadOnly,
        stencilReadOnly
    ) {
        colorFormats = /** @type {GPUTextureFormat[]} */ (GetParamArray(colorFormats));
        label ??= /*@__INLINE__*/ this.CreateStageLabel("Render Bundle Encoder");

        return this.Device.createRenderBundleEncoder({
            colorFormats, depthStencilFormat, label, sampleCount, depthReadOnly, stencilReadOnly
        });
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
        colorAttachments = /** @type {GPURenderPassColorAttachment[]} */ (GetParamArray(colorAttachments));
        label ??= /*@__INLINE__*/ this.CreateStageLabel("Render Pass");

        return this.#Descriptor =
        {
            depthStencilAttachment,
            occlusionQuerySet,
            colorAttachments,
            timestampWrites,
            maxDrawCount,
            label
        };
    }

    /**
     * @override
     * @param {GPUTextureFormat} [format = this.#PreferredCanvasFormat]
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
    #CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return { format, shaderLocation, offset };
    }

    #UpdateCanvasResolution()
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
            this.#Canvas.width = scaledWidth; this.#Canvas.height = scaledHeight;
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
     * @param {Pipeline} Pipeline
     * @param {GPUShaderModule | RenderPipelineDescriptor} [moduleDescriptor]
     * @param {boolean} [useInRenderPass] - Call immediately `GPURenderCommandsMixin.setPipeline()` with this
     * `Pipeline` to use it in an already created `GPURenderPassEncoder`. Throws a `RENDER_PASS_NOT_FOUND` warning if
     * there's no such active and recording `GPURenderPassEncoder`.
     */
    async AddPipeline(Pipeline, moduleDescriptor, useInRenderPass)
    {
        const pipeline = await Pipeline.Init(moduleDescriptor, this.Pipelines.length);

        if (useInRenderPass) this.#RenderPass
            ? this.#RenderPass.setPipeline(pipeline)
            : ThrowWarning(ERROR.RENDER_PASS_NOT_FOUND);

        this.Pipelines.push(Pipeline);
        return Pipeline;
    }

    /**
     * @param {Pipeline} Pipeline
     * @param {boolean} submit
     * @param {boolean} setPipeline
     * @param {boolean} [setRenderBuffers = true]
     * @param {boolean} [setBlendConstant = true]
     */
    #UsePipeline(Pipeline, submit, setPipeline, setRenderBuffers = true, setBlendConstant = true)
    {
        setPipeline ||= !this.#RenderPass;
        setRenderBuffers ||= setPipeline;
        setBlendConstant ||= setPipeline;

        if (!this.#RenderPass)
        {
            let colorAttachmentSubresource = "view";
            const colorAttachment = this.#Descriptor.colorAttachments[Pipeline.ColorAttachment];

            if (this.#MultisampleTexture)
            {
                colorAttachmentSubresource = "resolveTarget";
                colorAttachment.view = this.#MultisampleTexture.createView();
            }

            Pipeline.UseTextureView &&
                (colorAttachment[colorAttachmentSubresource] = Pipeline.TextureView ?? this.CurrentTextureView);

            this.#RenderPass = this.GetCommandEncoder().beginRenderPass(this.#Descriptor);
        }

        setBlendConstant && this.#RenderPass.setBlendConstant(Pipeline.BlendConstant);

        if (Pipeline.UseRenderBundles)
            Pipeline.ExecuteRenderBundles(this.#RenderPass);

        else
        {
            setPipeline && this.#RenderPass.setPipeline(Pipeline.GPUPipeline);

            setRenderBuffers && Pipeline.UseRenderBuffers(this.#RenderPass);

            Pipeline.UseBindGroups(this.#RenderPass);

            this.#RenderPass[Pipeline.DrawMethod](...Pipeline.DrawParams);
        }

        // End & destroy render pass without submitting the command buffer:
        Pipeline.DestroyPassEncoder && !submit && this.DestroyRenderPass();
    }

    /**
     * @param {Batch} Batch
     * @param {Float32Array} ProjectionMatrix
     * @param {boolean} submit
     */
    #RenderBatch({ Geometry, Material, Meshes }, ProjectionMatrix, submit)
    {
        let setRenderBuffers = Geometry.ID !== this.#BatchState.Geometry;
        let setBlendConstant = Material?.ID !== this.#BatchState.Material;

        for (
            let m = 0, l = Meshes.length; m < l; ++m,
            setRenderBuffers = setBlendConstant = false,
            this.#BatchState.Index = this.#BatchState.Pipeline.Index
        ) {
            const Mesh = Meshes[m], Pipeline = Mesh.Pipeline;
            const setPipeline = Pipeline.Index !== this.#BatchState.Index;

            // The geometry will be set when its ID is different from the one set by one of the
            // previous batches or when the meshes within the same batch have different pipelines.
            if (setRenderBuffers || setPipeline)
            {
                const { VertexBuffers, IndexBuffer, DrawParams } = Geometry;

                Pipeline.SetDrawParams.apply(Pipeline, DrawParams);
                this.#BatchState.Geometry = Geometry.ID;
                Pipeline.VertexBuffers = VertexBuffers;
                Pipeline.IndexBuffer = IndexBuffer;
            }

            // Material ID is different from the one set by one of the previous batches.
            // Blend constant **CAN** change and it's also possible to bind textures here.
            if (setBlendConstant || setPipeline)
            {
                // Blend constant will be updated only when current material's blend constant
                // is different from the one setted by the previous material in this batch
                // or when the meshes within the same batch have different pipelines.
                setBlendConstant = !!Material?.SetBlendConstant(this.#BatchState.Pipeline);
                this.#BatchState.Material = Material?.ID;
            }

            // Among other resources, bind groups have the projection
            // buffer of the mesh, so they will be always updated.
            Mesh.UpdateProjectionMatrix(ProjectionMatrix);
            Mesh.SetBindGroups();

            this.#UsePipeline(
                // New pipeline will be set only when its index is different from the one setted by the previous mesh.
                this.#BatchState.Pipeline = Pipeline, submit, setPipeline, setRenderBuffers, setBlendConstant
            );
        }
    }

    /**
     * @description Groups opaque and transpare meshes into batches by geometry and material `id`s.
     * @param {Map<string, Batch>} Batches
     * @param {Node[]} Meshes
     */
    #GroupMeshes(Batches, Meshes)
    {
        for (let m = 0, batch = void 0, l = Meshes.length; m < l; batch = void 0, ++m)
        {
            const Mesh = Meshes[m], { Geometry, Material } = Mesh;
            const id = Geometry.ID + `${(Material && `-${Material.ID}`) ?? ''}`;

            if (!(batch = Batches.get(id)))
            {
                batch = { Geometry, Material, Meshes: [] };
                Batches.set(id, batch);
            }

            batch.Meshes.push(Mesh);
        }
    }

    /**
     * @todo Improve batching system with hardware instancing
     * @param {import("../Scene").default} Scene
     * @param {boolean} [submit = true]
     */
    #RenderScene(Scene, submit = true)
    {
        Scene.UpdateWorldMatrix();

        const { Frustum, ProjectionMatrix, ViewProjectionMatrix } = Scene.MainCamera;
        const projectionMatrix = ViewProjectionMatrix || ProjectionMatrix;

        Scene.Traverse(node =>
        {
            // Collect only visible meshes.
            if (!node.Visible) return true;

            /** @todo Discard meshes that have the bounding sphere outside the camera's frustum. */

            // Separate meshes into 2 lists (opaque and transparent) based on a material property.
            (node.Material?.Transparent && this.#TransparentMeshes || this.#OpaqueMeshes).push(node);
        });

        // There are no meshes in the scene, skip rendering.
        if (!this.#OpaqueMeshes.length && !this.#TransparentMeshes.length)
            return ~this.DestroyRenderPass() && (this.CommandEncoder = void 0);

        /** @todo Sort opaque objects by distance to the camera front to back. */
        /** @todo Sort transparent objects by distance to the camera back to front. */

        this.#GroupMeshes(this.#OpaqueBatches, this.#OpaqueMeshes);
        this.#GroupMeshes(this.#TransparentBatches, this.#TransparentMeshes);

        this.#OpaqueBatches.forEach(Batch => this.#RenderBatch(Batch, projectionMatrix, submit));
        this.#TransparentBatches.forEach(Batch => this.#RenderBatch(Batch, projectionMatrix, submit));

        submit && this.Submit();

        this.#OpaqueBatches.clear();
        this.#OpaqueMeshes.splice(0);

        this.#TransparentBatches.clear();
        this.#TransparentMeshes.splice(0);
    }

    /**
     * @param {import("../Scene").default | boolean} [sceneOrSubmit = true]
     * @param {boolean} [submit = true] - Complete recording of the render pass commands sequence
     * (`GPURenderPassEncoder.end()`), complete recording of the commands sequence (`GPUCommandEncoder.finish()`),
     * schedule the execution of the command buffers by the GPU on this queue (`GPUQueue.submit()`) and destroy
     * the current `GPURenderPassEncoder` and `GPUCommandEncoder` after the last pipeline's primitives have been drawn.
     */
    Render(sceneOrSubmit = true, submit = true)
    {
        this.UseDepthStencilAttachment && this.#UpdateDepthStencilAttachment();

        if (typeof sceneOrSubmit === "boolean") submit = sceneOrSubmit;
        else return this.#RenderScene(sceneOrSubmit, submit);

        const pl = this.Pipelines.length;

        if (!(pl - 1) && this.Pipelines[0].Active)
            // Save some instructions if there's only one active pipeline:
            this.#UsePipeline(this.Pipelines[0], submit, false);

        else
            for (let p = 0; p < pl; ++p)
            {
                const Pipeline = /** @type {Pipeline} */ (this.Pipelines[p]);
                Pipeline.Active && this.#UsePipeline(Pipeline, submit, true);
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

    get RenderPassDescriptor()
    {
        return this.#Descriptor;
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

    /** @returns {Pipeline & { new(): Pipeline }} */
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
