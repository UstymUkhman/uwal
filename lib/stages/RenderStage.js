import { Texture } from "#/textures";
import { BaseStage } from "#/stages";
import { RenderPipeline } from "#/pipelines";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { CreateBuffer, GetGPUColorValue, GetParamArray, WriteBuffer, GetShaderModule } from "#/utils";

export default class RenderStage extends BaseStage
{
    /**
     * @typedef {Object} Batch
     * @property {number[]} ID
     * @property {number[]} Index
     * @property {number[]} Center
     * @property {number[]} Distance
     * @property {Pipeline} Pipeline
     * @property {Geometries} Geometry
     * @property {BindGroup[][]} BindGroups
     *
     * @typedef {import("../pipelines/BasePipeline").BindGroup} BindGroup
     * @typedef {import("../pipelines/BasePipeline").ShaderCode} ShaderCode
     * @typedef {import("../Device").CanvasConfiguration} CanvasConfiguration
     * @typedef {import("../Device").ConfigurationOptions} ConfigurationOptions
     *
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineInstance} Pipeline
     * @typedef {import("../geometries").Mesh | import("../geometries").Shape} Geometries
     * @typedef {Array<import("../primitives").Shape | import("../primitives").Mesh>} Meshes
     * @typedef {import("../pipelines/BasePipeline").ShaderModuleDescriptor} ShaderModuleDescriptor
     *
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineDescriptor & {
     *     pipelineName?: string;
     * }} RenderPipelineDescriptor
     *
     * @typedef {ShaderCode             |
     *           GPUShaderModule        |
     *           ShaderModuleDescriptor |
     *           RenderPipelineDescriptor
     * } NewRenderPipelineDescriptor
     */

    #Resolution = new Float32Array(3);
    UseDepthStencilAttachment = false;

    /** @type {HTMLCanvasElement} */ #Canvas;
    /** @type {GPUCanvasContext} */ #Context;
    /** @type {Meshes} */ #OpaqueMeshes = [];

    /** @type {GPUBuffer} */ #ResolutionBuffer;
    /** @type {Texture | undefined} */ #Texture;
    /** @type {Meshes} */ #TransparentMeshes = [];
    /** @type {number | undefined} */ #DPR = void 0;

    /** @type {GPUTexture | undefined} */ #DepthTexture;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPUTexture | undefined} */ #MultisampleTexture;
    /** @type {GPURenderPassEncoder | undefined} */ #RenderPass;

    /** @type {Map<string, Batch>} */ #OpaqueBatches = new Map();
    /** @type {GPURenderPassDescriptor | undefined} */ #Descriptor;
    /** @type {Map<string, Batch>} */ #TransparentBatches = new Map();

    /** @type {{ Pipeline: RenderPipeline | void, GeometryID: number }} */
    #BatchState = { Pipeline: void 0, GeometryID: -1 };

    /**
     * @param {GPUDevice} device
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasConfiguration} options
     * @param {string} [name = ""]
     */
    constructor(device, canvas, options, name = "")
    {
        super(device, "Render", name);
        !canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const context = /** @type {HTMLCanvasElement} */ (canvas).getContext("webgpu");
        !context && ThrowError(ERROR.CONTEXT_NOT_FOUND);

        /** @type {GPUCanvasContext} */ (context).configure(
            /** @type {GPUCanvasConfiguration} */ ({ device, ...options })
        );

        this.#Canvas = /** @type {HTMLCanvasElement} */ (canvas);
        this.#Context = /** @type {GPUCanvasContext} */ (context);

        this.#ResolutionBuffer = CreateBuffer(this.Device, {
            size: this.#Resolution.length * Float32Array.BYTES_PER_ELEMENT,
            label: "Render Pipeline Resolution Buffer",
            usage: USAGE.UNIFORM
        });

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
     * @param {GPUTexture | GPUTextureView} [view]
     * @param {GPULoadOp} [loadOp = "clear"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {GPUTextureView} [resolveTarget]
     * @param {GPUIntegerCoordinate} [depthSlice]
     */
    CreateColorAttachment(clearColor, view, loadOp = "clear", storeOp = "store", resolveTarget, depthSlice)
    {
        const clearValue = clearColor && GetGPUColorValue(clearColor);
        return /** @type {GPURenderPassColorAttachment} */ ({
            view, loadOp, storeOp, clearValue, resolveTarget, depthSlice
        });
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

        return /** @type {GPURenderPassDepthStencilAttachment} */ ({
            view, depthClearValue, depthLoadOp, depthStoreOp, depthReadOnly, ...stencilAttachment
        });
    }

    #UpdateDepthStencilAttachment()
    {
        const currentTexture = this.CurrentTexture;
        const { width, height } = currentTexture;

        // A new depth texture needs to be created if absent or if its size is different from current canvas texture:
        if (!this.#DepthTexture || this.#DepthTexture.width !== width || this.#DepthTexture.height !== height)
        {
            this.#DepthTexture?.destroy();

            this.#DepthTexture = /** @type {Texture} */ (this.#Texture).CreateTextureFromSource(currentTexture,
            {
                sampleCount: this.#MultisampleTexture?.sampleCount ?? 1,
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                label: "Depth Texture",
                format: "depth24plus",
                mipmaps: false
            });
        }

        const { depthStencilAttachment = this.CreateDepthStencilAttachment() } =
            /** @type {GPURenderPassDescriptor} */ (this.#Descriptor);

        depthStencilAttachment.view = this.#DepthTexture.createView();
    }

    /**
     * @param {GPUTextureFormat | GPUTextureFormat[]} [colorFormats = this.#PreferredCanvasFormat]
     * @param {GPUTextureFormat} [depthStencilFormat = "depth24plus"]
     * @param {string} [label]
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
     * @returns {GPURenderPassDescriptor}
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
     * @returns {import("../pipelines/BasePipeline").BindGroupLayoutEntry}
     */
    CreateStorageTextureBindingLayout(
        format = this.#PreferredCanvasFormat,
        access,
        viewDimension,
        visibility = GPUShaderStage.FRAGMENT,
        binding
    ) {
        return { binding, visibility, storageTexture: { access, format, viewDimension } };
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
        const shaderModuleDescriptor = typeof moduleDescriptor === "object" && "shader" in moduleDescriptor;
        const Pipeline = new this.Pipeline(/** @type {RenderPipelineDescriptor} */ (moduleDescriptor).pipelineName);
        const shaderCode = shaderModuleDescriptor && /** @type {{ shader: string }} */ (moduleDescriptor).shader || "";

        moduleDescriptor = GetShaderModule(/** @type {GPUShaderModule | RenderPipelineDescriptor} */ (moduleDescriptor))
            ?? ((shaderModule || shaderModuleDescriptor) && Pipeline.CreateShaderModule(.../** @type {ShaderCode} */ (
                Object.values([shaderModule && moduleDescriptor || shaderCode])
            )) || /** @type {GPUShaderModule} */ (moduleDescriptor));

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
        // Eventual checks for automatic pipeline deduplication can be done here.
        const pipeline = await /** @type {RenderPipeline} */ (Pipeline).Init(moduleDescriptor);
        const depthStencil = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor)?.depthStencil;

        // Add default depth stencil attachment if not set manually:
        if (!this.UseDepthStencilAttachment && depthStencil)
        {
            const descriptor = this.RenderPassDescriptor;

            this.CreatePassDescriptor(
                /** @type {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} */
                (descriptor.colorAttachments),
                this.CreateDepthStencilAttachment(),
                descriptor.label,
                descriptor.occlusionQuerySet,
                descriptor.timestampWrites,
                descriptor.maxDrawCount
            );
        }

        if (useInRenderPass) this.#RenderPass
            ? this.#RenderPass.setPipeline(pipeline)
            : ThrowWarning(ERROR.RENDER_PASS_NOT_FOUND);

        this.Pipelines.push(Pipeline);
        return Pipeline;
    }

    /**
     * @param {Pipeline} Pipeline
     * @param {boolean} submit
     * @param {boolean} [setPipeline = true]
     * @param {boolean} [setRenderBuffers = true]
     * @param {boolean} [setBlendConstant = setPipeline]
     */
    #UsePipeline(Pipeline, submit, setPipeline, setRenderBuffers = true, setBlendConstant = setPipeline)
    {
        setPipeline ||= !this.#RenderPass;
        setRenderBuffers ||= setPipeline;

        if (!this.#RenderPass)
        {
            let colorAttachmentSubresource = /** @type {"view" | "resolveTarget"} */ ("view");
            const Descriptor = /** @type {GPURenderPassDescriptor} */ (this.#Descriptor);

            const colorAttachment = /** @type {GPURenderPassColorAttachment[]} */
                (Descriptor.colorAttachments)[Pipeline.ColorAttachment];

            if (this.#MultisampleTexture)
            {
                colorAttachmentSubresource = "resolveTarget";
                colorAttachment.view = this.#MultisampleTexture.createView();
            }

            Pipeline.UseTextureView &&
                (colorAttachment[colorAttachmentSubresource] = Pipeline.TextureView ?? this.CurrentTextureView);

            this.#RenderPass = this.GetCommandEncoder().beginRenderPass(Descriptor);
        }

        setBlendConstant && this.#RenderPass.setBlendConstant(Pipeline.BlendConstant);

        if (Pipeline.UseRenderBundles)
            Pipeline.ExecuteRenderBundles(this.#RenderPass);

        else
        {
            setPipeline && this.#RenderPass.setPipeline(/** @type {GPURenderPipeline} */ (Pipeline.GPUPipeline));

            setRenderBuffers && Pipeline.UseRenderBuffers(this.#RenderPass);

            Pipeline.UseBindGroups(this.#RenderPass);

            this.#RenderPass[Pipeline.DrawMethod].apply(this.#RenderPass, Pipeline.DrawParams);
        }

        // End & destroy render pass without submitting the command buffer:
        Pipeline.DestroyPassEncoder && !submit && this.DestroyRenderPass();
    }

    /**
     * @param {Batch} Batch
     * @param {boolean} submit
     */
    #RenderBatch({ Pipeline, Geometry, BindGroups, Index }, submit)
    {
        // New pipeline will be set only when its index is
        // different from the one set by one of the previous batches.
        let setPipeline = Pipeline.ID !== this.#BatchState.Pipeline?.ID;

        // Vertex and index buffers will be set only when a geometry ID
        // is different from the one set by one of the previous batches.
        let setRenderBuffers = Geometry.ID !== this.#BatchState.GeometryID;

        for (let i = 0, l = Index.length; i < l; setPipeline = setRenderBuffers = false)
        {
            if (setPipeline || setRenderBuffers)
            {
                const { DrawParams, VertexBuffers, IndexBuffer } = Geometry;
                Pipeline.SetDrawParams.apply(Pipeline, DrawParams);

                this.#BatchState.GeometryID = Geometry.ID;
                Pipeline.VertexBuffers = VertexBuffers;
                Pipeline.IndexBuffer = IndexBuffer;
            }

            Pipeline.BindGroups = BindGroups[Index[i++]];

            this.#UsePipeline(Pipeline, submit, setPipeline, setRenderBuffers);
            this.#BatchState.Pipeline = /** @type {RenderPipeline} */ (Pipeline);
        }
    }

    /**
     * @description Groups opaque and transpare meshes or instances into batches by pipeline and geometry `ID`s.
     * @param {import("../Scene").Camera} Camera
     * @param {Map<string, Batch>} Batches
     * @param {Meshes} Meshes
     */
    #GroupMeshes(Camera, Batches, Meshes)
    {
        for (let m = 0, batch = /** @type {Batch | void} */ (void 0), l = Meshes.length; m < l; batch = void 0, ++m)
        {
            const Mesh = Meshes[m], { Geometry, Pipeline: P } = Mesh;
            Mesh.UpdateProjectionMatrix(Camera.ViewProjectionMatrix);

            // @ts-ignore Correct `Camera` type will treat this argument accordingly.
            const Center = Camera.GetViewSpaceCenter(Mesh);
            const Pipeline = /** @type {Pipeline} */ (P);
            const id = `${Pipeline.ID}-${Geometry.ID}`;

            /** @todo Move to dynamic growing typed arrays. */
            !(batch = Batches.get(id)) && Batches.set(id, batch = {
                Pipeline, Geometry, BindGroups: [], Distance: [], Center: [], Index: [], ID: []
            });

            batch.Index.push((batch.Index.at(-1) ?? -1) + 1);
            batch.Distance.push(Center + Mesh.Radius);
            batch.BindGroups.push(Mesh.BindGroups);
            batch.Center.push(Center);
            batch.ID.push(Mesh.ID);
        }
    }

    /**
    * @param {import("../Scene").default} Scene
    * @param {boolean} [submit = true]
    */
    #RenderScene(Scene, submit = true)
    {
        Scene.UpdateWorldMatrix();

        /** @todo Group and sort meshes and shapes by their render order value. */

        const Camera = /** @type {import("../Scene").Camera} */ (Scene.MainCamera);

        /** @todo Switch to GPU-based culling. */

        Scene.Traverse(node =>
        {
            const mesh = /** @type {Meshes[number]} */ (node);

            // Collect only visible meshes.
            if (!mesh.Visible) return true;

            // Continue traversing the child elements of the Scene making sure
            // each Mesh/Shape has a pipeline set, otherwise it will be skipped.
            if (!mesh.Pipeline) return false;

            // Skip `Mesh` and `Shape` instances outside the camera frustum / view.
            // @ts-ignore Correct `Camera` type will treat this argument accordingly.
            if (Camera.CullTest && !Camera.Contains(mesh)) return false;

            return !(
                // Split meshes into 2 lists (opaque and transparent) based on the mesh pipeline blending value.
                /** @type {Pipeline} */ (mesh.Pipeline).Transparent && this.#TransparentMeshes || this.#OpaqueMeshes
            ).push(mesh);
        });

        // There are no meshes in the scene, skip rendering.
        if (!this.#OpaqueMeshes.length && !this.#TransparentMeshes.length)
            return ~this.DestroyRenderPass() && (this.CommandEncoder = void 0) || void 0;

        this.#GroupMeshes(Camera, this.#OpaqueBatches, this.#OpaqueMeshes);
        this.#GroupMeshes(Camera, this.#TransparentBatches, this.#TransparentMeshes);

        this.#OpaqueBatches.forEach(Batch =>
        {
            const { ID, Index, Center } = Batch;
            Index.sort((a, b) => Center[a] === Center[b] && ID[a] - ID[b] || Center[a] - Center[b]);
            this.#RenderBatch(Batch, submit);
        });

        const TransparentBatches = Array.from(this.#TransparentBatches.values());

        if (this.#TransparentBatches.size > 1)
        {
            // Sort transparent batches by the maximum distance value, from the furthest to the closest.
            const Distance = TransparentBatches.map(({ ID, Index, Center, Distance }) =>
                Index.sort((a, b) => Center[a] === Center[b] && ID[a] - ID[b] || Center[b] - Center[a]) &&
                    Math.max.apply(null, Distance)
            );

            const Key = Array.from(this.#TransparentBatches.keys());
            const Index = Array.from(Key).map((_, k) => k).sort((a, b) => Distance[b] - Distance[a]);

            Index.forEach((index, i) => TransparentBatches[i] =
                /** @type {Batch} */ (this.#TransparentBatches.get(Key[index]))
            );
        }

        TransparentBatches.forEach(Batch => this.#RenderBatch(Batch, submit));

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

        for (let p = 0, l = this.Pipelines.length; p < l; ++p)
        {
            const Pipeline = /** @type {Pipeline} */ (this.Pipelines[p]);
            Pipeline.Active && this.#UsePipeline(Pipeline, submit);
        }

        return submit && this.Submit();
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
        return /** @type {GPURenderPassDescriptor} */ (this.#Descriptor);
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

    get Pipeline()
    {
        const { Name, Device } = this;
        const format = this.#PreferredCanvasFormat;

        return /** @type {Pipeline & { new(name?: string): Pipeline }} */ (
            /** @type {unknown} */ (class extends RenderPipeline
            {
                constructor(name = Name)
                {
                    super(Device, format, name);
                }
            })
        );
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
