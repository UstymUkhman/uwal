import { BasePipeline } from "@/pipeline";

export default class RenderPipeline extends BasePipeline
{
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [commandEncoderLabel = ""]
     * @param {GPUTextureFormat} [preferredFormat = undefined]
     */
    constructor(device, commandEncoderLabel, preferredFormat)
    {
        super(device, commandEncoderLabel);
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
     * @param {string} [label = ""]
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment = undefined]
     * @param {GPUQuerySet} [occlusionQuerySet = undefined]
     * @param {GPURenderPassTimestampWrites} [timestampWrites = undefined]
     * @param {GPUSize64} [maxDrawCount = undefined]
     */
    CreateRenderPassDescriptor(
        colorAttachments, label = "", depthStencilAttachment, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        const attachments = (
            /** @type {GPURenderPassColorAttachment[]} */
            (Array.isArray(colorAttachments) && colorAttachments || [colorAttachments])
        );

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
     * @param {GPUShaderModule} module
     * @param {string} [entry = "vertex"]
     * @param {Record<string, GPUPipelineConstantValue>} [constants = undefined]
     * @param {Iterable<GPUVertexBufferLayout | null>} [buffers = undefined]
     */
    CreateVertexState(module, entry = "vertex", constants, buffers)
    {
        return { module, entryPoint: entry, constants, buffers };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entry = "fragment"]
     * @param {Iterable<GPUColorTargetState | null>} [targets = [undefined]]
     * @param {Record<string, GPUPipelineConstantValue>} [constants = undefined]
     */
    CreateFragmentState(module, entry = "fragment", targets, constants)
    {
        targets ??= [{ format: this.#PreferredCanvasFormat }];
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
        return this.Device.createRenderPipeline({ ...descriptor, layout });
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

        for (let g = 0, l = this.BindGroups.length; g < l; ++g)
            this.#CurrentPass.setBindGroup(g, this.BindGroups[g]);

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
