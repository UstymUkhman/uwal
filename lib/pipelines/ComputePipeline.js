import { BasePipeline } from "#/pipelines";
import { GetShaderModule } from "#/utils";

/**
 * @typedef {Omit<import("./BasePipeline").default & ComputePipeline, "Init">} ComputePipeline
 *
 * @typedef {import("./BasePipeline").BasePipelineDescriptor & {
 *   entryPoint?: string;
 *   constants?: Record<string, GPUPipelineConstantValue>;
 * }} ComputePipelineDescriptor
 *
 * @exports ComputePipeline, ComputePipelineDescriptor
 */

export default class ComputePipeline extends BasePipeline
{
    /**
     * @param {GPUDevice} device
     * @param {string} [name = ""]
     */
    constructor(device, name)
    {
        super(device, "Compute", name);
    }

    /** @param {GPUShaderModule | ComputePipelineDescriptor} [moduleDescriptor] */
    async Init(moduleDescriptor)
    {
        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Compute Pipeline");
        const layout = /** @type {ComputePipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";
        const module = GetShaderModule(moduleDescriptor) ?? this.CreateShaderModule();

        return this.GPUPipeline = await this.Device.createComputePipelineAsync({
            label, layout, compute: { module, ...moduleDescriptor }
        });
    }
}
