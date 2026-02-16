import { Texture } from "#/textures";
import { BaseStage } from "#/stages";
import { RenderPipeline } from "#/pipelines";
import { USAGE } from "#/pipelines/Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { CreateBuffer, GetGPUColorValue, GetParamArray, WriteBuffer, GetShaderModule } from "#/utils";

export default class RenderStage extends BaseStage
{
    /**
     * @typedef {Array<Mesh | Shape>} Meshes
     * @typedef {import("../primitives").Mesh} Mesh
     * @typedef {import("../primitives").Shape} Shape
     * @typedef {Batch & { depth: number }} TransparentBatch
     *
     * @typedef {import("../pipelines/BasePipeline").ShaderCode} ShaderCode
     * @typedef {import("../Device").CanvasConfiguration} CanvasConfiguration
     * @typedef {import("../Device").ConfigurationOptions} ConfigurationOptions
     *
     * @typedef {{ Geometry: Geometries, Pipeline: Pipeline, Meshes: Meshes }} Batch
     * @typedef {import("../pipelines/RenderPipeline").RenderPipelineInstance} Pipeline
     * @typedef {import("../geometries").Mesh | import("../geometries").Shape} Geometries
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
    /** @type {Map<string, TransparentBatch>} */ #TransparentBatches = new Map();

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
    #RenderBatch({ Geometry, Pipeline, Meshes }, ProjectionMatrix, submit)
    {
        let setRenderBuffers = Geometry.ID !== this.#BatchState.GeometryID;
        // let setPipeline = Pipeline.ID !== this.#BatchState.PipelineID;
        let setPipeline = Pipeline.ID !== this.#BatchState.Pipeline?.ID;

        for (
            let m = 0, l = Meshes.length; m < l; ++m,
            setRenderBuffers = setPipeline = false //,
            // this.#BatchState.PipelineID = this.#BatchState.Pipeline?.ID || 0
        ) {
            const Mesh = Meshes[m], Pipeline = /** @type {RenderPipeline} */ (Mesh.Pipeline);
            // const setPipeline = this.#BatchState.PipelineID !== Pipeline.ID;

            // The geometry will be set when its ID is different from the one set by one of the
            // previous batches or when the meshes within the same batch have different pipelines.
            if (setRenderBuffers || setPipeline)
            {
                const { DrawParams, VertexBuffers, IndexBuffer } = Geometry;

                Pipeline.SetDrawParams.apply(Pipeline, DrawParams);
                // this.#BatchState.PipelineID = Pipeline.ID;
                this.#BatchState.GeometryID = Geometry.ID;
                Pipeline.VertexBuffers = VertexBuffers;
                Pipeline.IndexBuffer = IndexBuffer;
            }

            const setBlendConstant = false; // !!Mesh.SetBlendConstant?.(this.#BatchState.Pipeline);

            // Among other resources, bind groups have the projection
            // buffer of the mesh, so they will be always updated.
            Mesh.UpdateProjectionMatrix(ProjectionMatrix);
            Pipeline.BindGroups = Mesh.BindGroups;

            this.#UsePipeline(
                // New pipeline will be set only when its index is different from the one setted by the previous mesh.
                this.#BatchState.Pipeline = Pipeline, submit, setPipeline, setRenderBuffers, setBlendConstant
            );
        }
    }

    /**
     * @description Groups opaque and transpare meshes into batches by geometry and pipeline `ID`s.
     * @param {Map<string, Batch>} Batches
     * @param {Meshes} Meshes
     */
    #GroupMeshes(Batches, Meshes)
    {
        for (let m = 0, batch = /** @type {Batch | void} */ (void 0), l = Meshes.length; m < l; batch = void 0, ++m)
        {
            const Mesh = Meshes[m], { Geometry, Pipeline } = Mesh;
            // Meshes with no Pipeline will be discarded when traversing the scene.
            const id = `${Geometry.ID}-${/** @type {Pipeline} */ (Pipeline).ID}`;

            if (!(batch = Batches.get(id)))
            {
                const P = /** @type {Pipeline} */ (Pipeline);
                batch = { Geometry, Pipeline: P, Meshes: [] };
                Batches.set(id, /** @type {Batch} */ (batch));
            }

            /** @type {Batch} */ (batch).Meshes.push(Mesh);
        }
    }

    /**
     * @todo Improve batching system with hardware instancing.
     * @param {import("../Scene").default} Scene
     * @param {boolean} [submit = true]
     */
    #RenderScene(Scene, submit = true)
    {
        Scene.UpdateWorldMatrix();

        /** @todo Group and sort meshes and shapes by their render order value. */

        const Camera = /** @type {import("../Scene").Camera} */ (Scene.MainCamera);

        Scene.Traverse(node =>
        {
            const mesh = /** @type {Meshes[number]} */ (node);

            // Collect only visible meshes.
            if (!mesh.Visible) return true;

            // Continue traversing the Node children making
            // sure each Mesh/Shape has a pipeline set,
            // otherwise it will be skipped.
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

        this.#GroupMeshes(this.#OpaqueBatches, this.#OpaqueMeshes);
        this.#GroupMeshes(this.#TransparentBatches, this.#TransparentMeshes);

        this.#OpaqueBatches.forEach((Batch) =>
            Batch.Meshes.sort((Prev, Next) => {
                // @ts-ignore Correct `Camera` type will treat this argument accordingly.
                const PrevCenter = Camera.GetViewSpaceCenter(Prev);

                // @ts-ignore Correct `Camera` type will treat this argument accordingly.
                const NextCenter = Camera.GetViewSpaceCenter(Next);

                return PrevCenter === NextCenter && Prev.ID - Next.ID || PrevCenter - NextCenter;
            })
        );

        this.#TransparentBatches.forEach((Batch) =>
            Batch.Meshes.sort((Prev, Next) => {
                // @ts-ignore Correct `Camera` type will treat this argument accordingly.
                const PrevCenter = Camera.GetViewSpaceCenter(Prev);

                // @ts-ignore Correct `Camera` type will treat this argument accordingly.
                const NextCenter = Camera.GetViewSpaceCenter(Next);

                return PrevCenter === NextCenter && Prev.ID - Next.ID || NextCenter - PrevCenter;
            })
        );

        // Sort transparent batches by the maximum depth value within each batch, from the furthest to the closest.
        this.#TransparentBatches.forEach(Batch =>
            // @ts-ignore Correct `Camera` type will treat this argument accordingly.
            Batch.depth = Math.max(...Batch.Meshes.map(Camera.GetViewSpaceDistance.bind(Camera)))
        );

        this.#TransparentBatches = new Map([...this.#TransparentBatches.entries()].sort(
            ([, { depth: prevDepth }], [, { depth: nextDepth }]) => nextDepth - prevDepth)
        );

        const projectionMatrix = Camera.ViewProjectionMatrix;

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
