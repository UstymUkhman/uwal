import { GetParamArray } from "#/utils";
import { BasePipeline } from "#/pipelines";

/**
 * @typedef {import("./BasePipeline").BasePipelineDescriptor} BaseDescriptor
 *
 * @typedef {BaseDescriptor & {
 *   vertex?: GPUVertexState;
 *   fragment?: GPUFragmentState;
 *   primitive?: GPUPrimitiveState;
 *   depthStencil?: GPUDepthStencilState;
 *   multisample?: GPUMultisampleState;
 * }} RenderPipelineDescriptor
 *
 * @exports RenderPipelineDescriptor
 */

export default class RenderPipeline extends BasePipeline
{
    /**
     * @param {GPUDevice} device
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        super(device, "Render", programName);
    }

    /** @param {RenderPipelineDescriptor | GPUShaderModule} [moduleDescriptor] */
    async Init(moduleDescriptor = {})
    {
        let module = this.GetShaderModule(moduleDescriptor);
        let { vertex, fragment } = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor);

        !module && !vertex && (module = this.CreateShaderModule());

        if (module)
        {
            vertex ??= this.CreateVertexState(module);
            fragment ??= this.CreateFragmentState(module);
        }

        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Render Pipeline");
        const layout = /** @type {RenderPipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";

        return this.Pipeline = await this.Device.createRenderPipelineAsync({
            label, layout, vertex, fragment, ...moduleDescriptor
        });
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entryPoint = "vertex"]
     * @param {GPUVertexBufferLayout | GPUVertexBufferLayout[]} [buffers]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateVertexState(module, entryPoint = "vertex", buffers, constants)
    {
        buffers = /** @type {GPUVertexBufferLayout[]} */ (GetParamArray(buffers));
        return { module, entryPoint, buffers, constants };
    }

    /**
     * @param {GPUShaderModule} module
     * @param {string} [entryPoint = "fragment"]
     * @param {GPUColorTargetState | GPUColorTargetState[]} [targets]
     * @param {Record<string, GPUPipelineConstantValue>} [constants]
     */
    CreateFragmentState(module, entryPoint = "fragment", targets, constants)
    {
        targets ??= this.CreateTargetState();
        targets = /** @type {GPUColorTargetState[]} */ (GetParamArray(targets));
        return { module, entryPoint, targets, constants };
    }
}
