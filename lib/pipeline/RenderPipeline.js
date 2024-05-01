import { BasePipeline } from "@/pipeline";

export default class RenderPipeline extends BasePipeline
{
    /** @type {GPUBuffer[]} */ #VertexBuffers = [];
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [programName = ""]
     * @param {GPUTextureFormat} [preferredFormat = undefined]
     */
    constructor(device, programName, preferredFormat)
    {
        super(device, programName);
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
        buffers = Array.isArray(buffers) ? buffers : [buffers];
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
        targets = Array.isArray(targets) ? targets : [targets];
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
        return this.Device.createRenderPipeline({ ...descriptor, label, layout });
    }

    /** @param {GPUBuffer | GPUBuffer[]} vertexBuffers */
    SetVertexBuffers(vertexBuffers)
    {
        this.#VertexBuffers = (/** @type {GPUBuffer[]} */ (
            Array.isArray(vertexBuffers)
                && vertexBuffers
                || [vertexBuffers]
            )
        );
    }

    /**
     * @param {GPURenderPassDescriptor} descriptor
     * @param {GPURenderPipeline} pipeline
     * @typedef {GPUSize32[]} DrawParams
     * @memberof DrawParams vertexCount
     * @memberof DrawParams [instanceCount = undefined]
     * @memberof DrawParams [firstVertex = undefined]
     * @memberof DrawParams [firstInstance = undefined]
     * @param {DrawParams | GPUSize32} drawParams
     * @param {boolean} [submit = true]
     */
    Render(descriptor, pipeline, drawParams, submit = true)
    {
        if (!this.#CurrentPass)
        {
            const encoder = this.CreateCommandEncoder();
            this.#CurrentPass = encoder.beginRenderPass(descriptor);
            this.#CurrentPass.setPipeline(pipeline);
        }

        for (let v = 0, l = this.#VertexBuffers.length; v < l; ++v)
            this.#CurrentPass.setVertexBuffer(v, this.#VertexBuffers[v]);
            // Can also have `offset?: GPUSize64` as a third argument
            // and `size?: GPUSize64` as a fourth argument.

        for (let g = 0, l = this.BindGroups.length; g < l; ++g)
            this.#CurrentPass.setBindGroup(g, this.BindGroups[g]);
            // Can also have `dynamicOffsets?: Iterable<GPUBufferDynamicOffset>` as a third argument.

        // @ts-ignore
        this.#CurrentPass.draw(...(Array.isArray(drawParams) && drawParams || [drawParams]));

        if (submit)
        {
            this.#CurrentPass.end();
            this.#CurrentPass = undefined;
            this.SubmitCommandBuffer();
        }
    }

    get CurrentPass()
    {
        return this.#CurrentPass;
    }
}
