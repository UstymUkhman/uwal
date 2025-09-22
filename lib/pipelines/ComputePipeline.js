import { ERROR, ThrowWarning } from "#/Errors";
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

    /**
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {GPUShaderModule | ComputePipelineDescriptor} [moduleDescriptor]
     * @param {number} [index = 0]
     */
    async Init(moduleDescriptor = {}, index = 0)
    {
        if ((new Error).stack?.split("\n")[2]?.trim().split(" ")[1] !== "ComputeStage.AddPipeline")
            ThrowWarning(ERROR.FORBIDDEN_METHOD_CALL, "`ComputePipeline.Init`." );

        let { label, layout } = moduleDescriptor; this.Index = index;
        label ??= this.CreatePipelineLabel("Compute Pipeline"); layout ??= "auto";
        const module = GetShaderModule(moduleDescriptor) ?? this.CreateShaderModule();

        return this.GPUPipeline = await this.Device.createComputePipelineAsync({
            label, layout, compute: { module, ...moduleDescriptor }
        });
    }
}
