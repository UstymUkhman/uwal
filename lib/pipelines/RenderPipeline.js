import { BasePipeline } from "@/pipelines";

export default class RenderPipeline extends BasePipeline
{
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

    /** @type {GPUBuffer[]} */ #VertexBuffers = [];
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {IndexBufferParams | undefined} */ #IndexBuffer;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [programName = ""]
     * @param {GPUTextureFormat} [preferredFormat = undefined]
     */
    constructor(device, programName, preferredFormat)
    {
        super(device, programName, "Render");
        this.#PreferredCanvasFormat = preferredFormat;
    }

    /**
     * @param {GPUTextureView} [view = undefined]
     * @param {GPULoadOp} [loadOp = "load"]
     * @param {GPUStoreOp} [storeOp = "store"]
     * @param {GPUColor} [clearValue = undefined]
     * @param {GPUTextureView} [resolveTarget = undefined]
     * @param {GPUIntegerCoordinate} [depthSlice = undefined]
     */
    CreateColorAttachment(view, loadOp = "load", storeOp = "store", clearValue, resolveTarget, depthSlice)
    {
        return { view, loadOp, storeOp, clearValue, resolveTarget, depthSlice };
    }

    /**
     * @param {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} colorAttachments
     * @param {string} [label = undefined]
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment = undefined]
     * @param {GPUQuerySet} [occlusionQuerySet = undefined]
     * @param {GPURenderPassTimestampWrites} [timestampWrites = undefined]
     * @param {GPUSize64} [maxDrawCount = undefined]
     */
    CreateRenderPassDescriptor(
        colorAttachments, label, depthStencilAttachment, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        const attachments = (
            /** @type {GPURenderPassColorAttachment[]} */
            (Array.isArray(colorAttachments) && colorAttachments || [colorAttachments])
        );

        label ??= this.CreateProgramLabel("Render Pass");

        return {
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
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers = undefined]
     * @param {Record<string, GPUPipelineConstantValue>} [constants = undefined]
     */
    CreateVertexState(module, entry = "vertex", buffers, constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (Array.isArray(buffers) && buffers || [buffers]);
        return { module, entryPoint: entry, buffers, constants };
    }

    /**
     * @param {GPUTextureFormat} [format = undefined]
     * @param {GPUBlendState} [blend = undefined]
     * @param {GPUColorWriteFlags} [writeMask = undefined]
     */
    CreateFragmentColorTarget(format = this.#PreferredCanvasFormat, blend, writeMask)
    {
        return { format, blend, writeMask };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets = undefined]
     * @param {Record<string, GPUPipelineConstantValue>} [constants = undefined]
     */
    CreateFragmentState(module, entry = "fragment", targets, constants)
    {
        targets ??= [this.CreateFragmentColorTarget()];
        targets = /** @type {GPUColorTargetState[]} */ (Array.isArray(targets) && targets || [targets]);
        return { module, entryPoint: entry, targets, constants };
    }

    /**
     * @typedef {Object} RenderPipelineDescriptor
     * @property {GPUVertexState} vertex
     * @property {string} [label = undefined]
     * @property {GPUFragmentState} [fragment = undefined]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {GPUPrimitiveState} [primitive = undefined]
     * @property {GPUDepthStencilState} [depthStencil = undefined]
     * @property {GPUMultisampleState} [multisample = undefined]
     * @param {RenderPipelineDescriptor} descriptor
     */
    CreateRenderPipeline(descriptor)
    {
        const layout = descriptor.layout ?? "auto";
        const label = descriptor.label ?? this.CreateProgramLabel("Render Pipeline");
        return this.Pipeline = this.Device.createRenderPipeline({ ...descriptor, label, layout });
    }

    /** @param {GPUBuffer | GPUBuffer[]} vertexBuffers */
    SetVertexBuffers(vertexBuffers)
    {
        this.#VertexBuffers = (/** @type {GPUBuffer[]} */ (
            Array.isArray(vertexBuffers) && vertexBuffers || [vertexBuffers]
        ));
    }

    /**
     * @param {GPUBuffer} buffer
     * @param {GPUIndexFormat} [format = "uint32"]
     * @param {GPUSize64} [offset = undefined]
     * @param {GPUSize64} [size = undefined]
     */
    SetIndexBuffer(buffer, format = "uint32", offset, size)
    {
        this.#IndexBuffer = { buffer, format, offset, size };
    }

    /**
     * @param {GPURenderPassDescriptor} descriptor
     * @param {GPURenderPipeline} pipeline
     *
     * @typedef {GPUSize32[]} DrawParams
     * @memberof DrawParams vertexCount
     * @memberof DrawParams [instanceCount = undefined]
     * @memberof DrawParams [firstVertex = undefined]
     * @memberof DrawParams [firstInstance = undefined]
     *
     * @typedef {GPUSize32[]} IndexedParams
     * @memberof IndexedParams indexCount
     * @memberof IndexedParams [instanceCount = undefined]
     * @memberof IndexedParams [firstIndex = undefined]
     * @memberof IndexedParams [baseVertex = undefined]
     * @memberof IndexedParams [firstInstance = undefined]
     *
     * @param {DrawParams | IndexedParams | GPUSize32} params
     * @param {boolean} [submit = true]
     */
    Render(descriptor, pipeline, params, submit = true)
    {
        if (!this.#CurrentPass)
        {
            const encoder = this.GetCommandEncoder() ?? this.CreateCommandEncoder();
            this.#CurrentPass = encoder.beginRenderPass(descriptor);
            this.#CurrentPass.setPipeline(pipeline);

            this.#CurrentPassDraw = this.#IndexBuffer
                ? this.#CurrentPass.drawIndexed.bind(this.#CurrentPass)
                : this.#CurrentPass.draw.bind(this.#CurrentPass);
        }

        for (let v = 0, l = this.#VertexBuffers.length; v < l; ++v)
            this.#CurrentPass.setVertexBuffer(v, this.#VertexBuffers[v]);
            // Can also have `offset?: GPUSize64` as a third argument
            // and `size?: GPUSize64` as a fourth argument.

        this.#IndexBuffer && this.#CurrentPass.setIndexBuffer(
            this.#IndexBuffer.buffer,
            this.#IndexBuffer.format,
            this.#IndexBuffer.offset,
            this.#IndexBuffer.size
        );

        for (let g = 0, l = this.BindGroups.length; g < l; ++g)
            this.#CurrentPass.setBindGroup(g, this.BindGroups[g]);
            // Can also have `dynamicOffsets?: Iterable<GPUBufferDynamicOffset>` as a third argument.

        // @ts-ignore
        this.#CurrentPassDraw(...(Array.isArray(params) && params || [params]));

        if (submit)
        {
            this.#CurrentPass.end();
            this.SubmitCommandBuffer();
            this.DestroyCommandEncoder();
            this.#CurrentPass = undefined;
        }
    }

    get CurrentPass()
    {
        return this.#CurrentPass;
    }
}
