import { BasePipeline } from "@/pipelines";
import { ERROR, ThrowError } from "@/Errors";

export default class RenderPipeline extends BasePipeline
{
    /**
     * @typedef {Object} VertexBuffer
     * @property {GPUBuffer} buffer
     * @property {GPUSize64} [offset]
     * @property {GPUSize64} [size]
     */

    /**
     * @typedef {Object} IndexBufferParams
     * @property {GPUBuffer} buffer
     * @property {GPUIndexFormat} format
     * @property {GPUSize64} offset
     * @property {GPUSize64} size
     */

    /** @type {(
        count: GPUSize32,
        instanceCount?: GPUSize32,
        first?: GPUSize32,
        firstInstanceOrBaseVertex?: GPUSize32,
        firstInstance?: GPUSize32
    ) => void} */ #CurrentPassDraw;

    #UseCurrentTextureView = false;
    #Resolution = new Float32Array(2);

    /** @type {HTMLCanvasElement} */ #Canvas;
    /** @type {GPUCanvasContext} */ #Context;

    /** @type {GPUBuffer} */ #ResolutionBuffer;
    /** @type {VertexBuffer[]} */ #VertexBuffers = [];
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {IndexBufferParams | undefined} */ #IndexBuffer;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /** @typedef {[GPUBuffer, GPUIndexFormat, GPUSize64, GPUSize64]} IndexBufferParamsValues */
    /** @type {IndexBufferParams | IndexBufferParamsValues} */ #PrevIndexBuffer;
    /** @type {boolean} */ #PrevUseCurrentTextureView;
    /** @type {VertexBuffer[]} */ #PrevVertexBuffers;

    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     * @param {HTMLCanvasElement} [canvas]
     * @param {import("../UWAL").ConfigurationOptions} [options = {}]
     */
    constructor(device, programName, canvas, options)
    {
        super(device, programName, "Render");
        !canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const context = canvas.getContext("webgpu");
        !context && ThrowError(ERROR.CONTEXT_NOT_FOUND);

        this.#PreferredCanvasFormat = options.format ?? navigator.gpu.getPreferredCanvasFormat();
        context.configure({ device, ...options, format: this.#PreferredCanvasFormat });

        this.#ResolutionBuffer = this.CreateBuffer(
        {
            size: this.#Resolution.length * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            label: "Render Pipeline Resolution Buffer"
        });

        this.#Canvas = canvas;
        this.#Context = context;

        this.#UpdateCanvasResolution();
    }

    #UpdateCanvasResolution()
    {
        this.#Resolution.set([this.#Canvas.width, this.#Canvas.height]);
        this.WriteBuffer(this.#ResolutionBuffer, this.#Resolution);
    }

    /**
     * @param {number} width
     * @param {number} height
     */
    SetCanvasSize(width, height)
    {
        !this.Device && ThrowError(ERROR.DEVICE_NOT_FOUND);
        !this.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);

        const { maxTextureDimension2D } = this.Device.limits;

        width = Math.max(1, Math.min(width, maxTextureDimension2D));
        height = Math.max(1, Math.min(height, maxTextureDimension2D));

        if (this.#Canvas.width !== width || this.#Canvas.height !== height)
        {
            this.#Canvas.width = width;
            this.#Canvas.height = height;
            this.#UpdateCanvasResolution();
        }
    }

    /**
     * @param {GPUTextureView} [view]
     * @param {GPULoadOp} [loadOp = "clear"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {GPUColor} [clearValue]
     * @param {GPUTextureView} [resolveTarget]
     * @param {GPUIntegerCoordinate} [depthSlice]
     */
    CreateColorAttachment(view, loadOp = "clear", storeOp = "store", clearValue, resolveTarget, depthSlice)
    {
        return { view, loadOp, storeOp, clearValue, resolveTarget, depthSlice };
    }

    /**
     * @param {GPUTextureView} [view]
     * @param {number} [depthClearValue = 1]
     * @param {GPULoadOp} [depthLoadOp = "clear"]
     * @param {GPUStoreOp} [depthStoreOp = "store"]
     * @param {boolean} [depthReadOnly]
     */
    CreateDepthAttachment(view, depthClearValue = 1, depthLoadOp = "clear", depthStoreOp = "store", depthReadOnly)
    {
        return { view, depthClearValue, depthLoadOp, depthStoreOp, depthReadOnly };
    }

    /**
     * @param {GPUStencilValue} [stencilClearValue]
     * @param {GPULoadOp} [stencilLoadOp = "clear"]
     * @param {GPUStoreOp} [stencilStoreOp = "store"]
     * @param {boolean} [stencilReadOnly]
     */
    CreateStencilAttachment(stencilClearValue, stencilLoadOp = "clear", stencilStoreOp = "store", stencilReadOnly)
    {
        return { stencilClearValue, stencilLoadOp, stencilStoreOp, stencilReadOnly };
    }

    /**
     * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
     * @param {string} [label]
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment]
     * @param {GPUQuerySet} [occlusionQuerySet]
     * @param {GPURenderPassTimestampWrites} [timestampWrites]
     * @param {GPUSize64} [maxDrawCount]
     */
    CreatePassDescriptor(
        colorAttachments, label, depthStencilAttachment, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        const attachments = (
            /** @type {GPURenderPassColorAttachment[]} */
            (Array.isArray(colorAttachments) && colorAttachments || [colorAttachments])
        );

        this.#UseCurrentTextureView = !attachments.some(({ view }) => !!view);

        label ??= this.CreatePipelineLabel("Render Pass");

        return this.Descriptor =
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
     * @param {GPUVertexFormat} format
     * @param {GPUIndex32} [shaderLocation = 0]
     * @param {GPUSize64} [offset = 0]
     */
    CreateVertexBufferAttribute(format, shaderLocation = 0, offset = 0)
    {
        return { format, shaderLocation, offset };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "vertex"]
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateVertexState(module, entry = "vertex", buffers, constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (Array.isArray(buffers) && buffers || [buffers]);
        return { module, entryPoint: entry, buffers, constants };
    }

    /**
     * @param {GPUTextureFormat} [format]
     * @param {GPUBlendState} [blend]
     * @param {GPUColorWriteFlags} [writeMask]
     */
    CreateFragmentColorTarget(format = this.#PreferredCanvasFormat, blend, writeMask)
    {
        return { format, blend, writeMask };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateFragmentState(module, entry = "fragment", targets, constants)
    {
        targets ??= [this.CreateFragmentColorTarget()];
        targets = /** @type {GPUColorTargetState[]} */ (Array.isArray(targets) && targets || [targets]);
        return { module, entryPoint: entry, targets, constants };
    }

    /**
     * @typedef {Object} RenderPipelineDescriptor
     * @property {string} [label]
     * @property {GPUShaderModule} [module]
     * @property {GPUVertexState} [vertex]
     * @property {GPUFragmentState} [fragment]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {GPUPrimitiveState} [primitive]
     * @property {GPUDepthStencilState} [depthStencil]
     * @property {GPUMultisampleState} [multisample]
     *
     * @param {RenderPipelineDescriptor} descriptor
     */
    CreatePipeline(descriptor)
    {
        const layout = descriptor.layout ?? "auto";
        let { module, vertex, fragment } = descriptor;

        if (module)
        {
            vertex ??= this.CreateVertexState(module);
            fragment ??= this.CreateFragmentState(module);
        }

        !module && !vertex && ThrowError(ERROR.VERTEX_STATE_NOT_FOUND);
        const label = descriptor.label ?? this.CreatePipelineLabel("Render Pipeline");
        return this.Pipeline = this.Device.createRenderPipeline({ ...descriptor, vertex, fragment, label, layout });
    }

    /** @override */
    SavePipelineState()
    {
        super.SavePipelineState();

        this.#PrevIndexBuffer = this.#IndexBuffer;
        this.#PrevVertexBuffers = this.#VertexBuffers;
        this.#PrevUseCurrentTextureView = this.#UseCurrentTextureView;

        this.#PrevIndexBuffer &&= /** @type {[GPUBuffer, GPUIndexFormat, GPUSize64, GPUSize64]} */
            (Object.values(this.#PrevIndexBuffer));
    }

    /** @override */
    RestorePipelineState()
    {
        super.RestorePipelineState();

        this.#VertexBuffers = this.#PrevVertexBuffers;
        this.#UseCurrentTextureView = this.#PrevUseCurrentTextureView; // @ts-ignore
        this.SetIndexBuffer(...(Array.isArray(this.#PrevIndexBuffer) && this.#PrevIndexBuffer || [undefined]));
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    SetVertexBuffers(vertexBuffers, offsets, sizes)
    {
        offsets = /** @type {GPUSize64[]} */ (Array.isArray(offsets) && offsets || [offsets]);
        sizes = /** @type {GPUSize64[]} */ (Array.isArray(sizes) && sizes || [sizes]);

        this.#VertexBuffers = /** @type {VertexBuffer[]} */ (Array.isArray(vertexBuffers)
            && vertexBuffers.map((buffer, b) => ({ buffer, offset: offsets[b], size: sizes[b] }))
            || [{ buffer: vertexBuffers, offset: offsets[0], size: sizes[0] }]
        );
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} vertexBuffers
     * @param {GPUSize64 | GPUSize64[]} [offsets]
     * @param {GPUSize64 | GPUSize64[]} [sizes]
     */
    AddVertexBuffers(vertexBuffers, offsets, sizes)
    {
        offsets = /** @type {GPUSize64[]} */ (Array.isArray(offsets) && offsets || [offsets]);
        sizes = /** @type {GPUSize64[]} */ (Array.isArray(sizes) && sizes || [sizes]);

        // @ts-ignore
        this.#VertexBuffers.push(...(Array.isArray(vertexBuffers)
            && vertexBuffers.map((buffer, b) => ({ buffer, offset: offsets[b], size: sizes[b] }))
            || [{ buffer: vertexBuffers, offset: offsets[0], size: sizes[0] }])
        );
    }

    /**
     * @param {GPUBuffer} [buffer]
     * @param {GPUIndexFormat} [format = "uint32"]
     * @param {GPUSize64} [offset]
     * @param {GPUSize64} [size]
     */
    SetIndexBuffer(buffer, format = "uint32", offset, size)
    {
        this.#IndexBuffer = buffer && { buffer, format, offset, size };
    }

    /**
     * @typedef {GPUSize32[]} DrawParams
     * @memberof DrawParams vertexCount
     * @memberof DrawParams [instanceCount]
     * @memberof DrawParams [firstVertex]
     * @memberof DrawParams [firstInstance]
     *
     * @typedef {GPUSize32[]} IndexedParams
     * @memberof IndexedParams indexCount
     * @memberof IndexedParams [instanceCount]
     * @memberof IndexedParams [firstIndex]
     * @memberof IndexedParams [baseVertex]
     * @memberof IndexedParams [firstInstance]
     *
     * @param {DrawParams | IndexedParams | GPUSize32} params
     * @param {boolean} [submit = true]
     */
    Render(params, submit = true)
    {
        if (!this.#CurrentPass)
        {
            this.#UseCurrentTextureView && (
                /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
                    .colorAttachments[0].view = this.CurrentTextureView
            );

            this.#CurrentPass = this.GetCommandEncoder().beginRenderPass(
                /** @type {GPURenderPassDescriptor} */ (this.Descriptor)
            );

            this.#CurrentPass.setPipeline(/** @type {GPURenderPipeline} */ (this.Pipeline));

            this.#CurrentPassDraw = this.#IndexBuffer
                ? this.#CurrentPass.drawIndexed.bind(this.#CurrentPass)
                : this.#CurrentPass.draw.bind(this.#CurrentPass);
        }

        for (let v = 0, l = this.#VertexBuffers.length; v < l; ++v)
        {
            const { buffer, offset, size } = this.#VertexBuffers[v];
            this.#CurrentPass.setVertexBuffer(v, buffer, offset, size);
        }

        this.#IndexBuffer && this.#CurrentPass.setIndexBuffer(
            this.#IndexBuffer.buffer,
            this.#IndexBuffer.format,
            this.#IndexBuffer.offset,
            this.#IndexBuffer.size
        );

        for (let g = 0, a = 0, l = this.BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.BindGroups[g];
            active && this.#CurrentPass.setBindGroup(a++, bindGroup, dynamicOffsets);
        }

        // @ts-ignore
        this.#CurrentPassDraw(...(Array.isArray(params) && params || [params]));

        submit && this.Submit();
    }

    DestroyCurrentPass()
    {
        this.#CurrentPass?.end();
        this.#CurrentPass = undefined;
    }

    Submit()
    {
        this.DestroyCurrentPass();
        this.SubmitCommandBuffer();
        this.SetCommandEncoder(undefined);
    }

    Destroy()
    {
        this.DestroyCurrentPass();
        this.#Context?.unconfigure();
    }

    get Canvas()
    {
        return this.#Canvas;
    }

    get Context()
    {
        return this.#Context;
    }

    get AspectRatio()
    {
        !this.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);
        return this.#Canvas.width / this.#Canvas.height;
    }

    get CurrentTexture()
    {
        return this.#Context.getCurrentTexture();
    }

    get CurrentTextureView()
    {
        return this.CurrentTexture.createView();
    }

    get ResolutionBuffer()
    {
        return this.#ResolutionBuffer;
    }

    get CurrentPass()
    {
        return this.#CurrentPass;
    }
}
