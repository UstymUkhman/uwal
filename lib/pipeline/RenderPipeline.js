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
     * @param {GPUTextureView | undefined} view
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
     * @param {Iterable<GPURenderPassColorAttachment | null>} colorAttachments
     * @param {string} [label = ""]
     * @param {GPURenderPassDepthStencilAttachment} [depthStencilAttachment = undefined]
     * @param {GPUQuerySet} [occlusionQuerySet = undefined]
     * @param {GPURenderPassTimestampWrites} [timestampWrites = undefined]
     * @param {GPUSize64} [maxDrawCount = undefined]
     */
    CreateRenderPassDescriptor(
        colorAttachments, label = "", depthStencilAttachment, occlusionQuerySet, timestampWrites, maxDrawCount
    ) {
        return { colorAttachments, label, depthStencilAttachment, occlusionQuerySet, timestampWrites, maxDrawCount };
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
     * @typedef {Object} DrawParams
     * @property {GPUSize32} vertexCount
     * @property {GPUSize32} [instanceCount = undefined]
     * @property {GPUSize32} [firstVertex = undefined]
     * @property {GPUSize32} [firstInstance = undefined]
     * @param {DrawParams | GPUSize32} drawParams
     * @param {boolean} [submit = true]
     */
    Render(descriptor, pipeline, drawParams, submit = true)
    {
        if (!this.#CurrentPass)
        {
            const encoder = this.CommandEncoder ?? this.CreateCommandEncoder();
            this.#CurrentPass = encoder.beginRenderPass(descriptor);
            this.#CurrentPass.setPipeline(pipeline);
        }

        for (let g = 0, l = this.BindGroups.length; g < l; ++g)
            this.#CurrentPass.setBindGroup(g, this.BindGroups[g]);

        drawParams = typeof drawParams === "number"
            ? { vertexCount: drawParams }
            : drawParams;

        this.#CurrentPass.draw(
            drawParams.vertexCount,
            drawParams.instanceCount,
            drawParams.firstVertex,
            drawParams.firstInstance
        );

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
