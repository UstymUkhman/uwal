import { BasePipeline } from "#/pipelines";

/**
 * @typedef {import("./BasePipeline").BasePipelineDescriptor} BaseDescriptor
 *
 * @typedef {BaseDescriptor & {
 *   entryPoint?: string;
 *   constants?: Record<string, GPUPipelineConstantValue>;
 * }} ComputePipelineDescriptor
 *
 * @exports ComputePipelineDescriptor
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

    /** @param {ComputePipelineDescriptor | GPUShaderModule} [moduleDescriptor] */
    async Init(moduleDescriptor)
    {
        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Compute Pipeline");
        const layout = /** @type {ComputePipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";
        const module = this.GetShaderModule(moduleDescriptor) ?? this.CreateShaderModule();

        return this.GPUPipeline = await this.Device.createComputePipelineAsync({
            label, layout, compute: { module, ...moduleDescriptor }
        });
    }
}
