import { ERROR, ThrowWarning } from "#/Errors";
import { BasePipeline } from "#/pipelines";
import { GetShaderModule } from "#/utils";

let ID = 0;

/**
 * @typedef {Omit<import("./BasePipeline").default & ComputePipeline, "Init">} ComputePipelineInstance
 *
 * @typedef {import("./BasePipeline").BasePipelineDescriptor & {
 *   entryPoint?: string;
 *   constants?: Record<string, GPUPipelineConstantValue>;
 * }} ComputePipelineDescriptor
 *
 * @exports ComputePipelineInstance, ComputePipelineDescriptor
 */

export default class ComputePipeline extends BasePipeline
{
    /**
     * @param {GPUDevice} device
     * @param {string} [name = ""]
     */
    constructor(device, name = "")
    {
        super(ID++, device, "Compute", name);
    }

    /**
     * @throws Invalid method call warning
     * @param {GPUShaderModule | ComputePipelineDescriptor} [moduleDescriptor]
     */
    async Init(moduleDescriptor = {})
    {
        if ((new Error).stack?.split("\n")[2]?.trim().split(" ")[1].split(".")[1] !== "AddPipeline")
            ThrowWarning(ERROR.INVALID_CALL, "method: `ComputePipeline.Init`." );

        const module = GetShaderModule(moduleDescriptor) ?? this.CreateShaderModule();
        let { label, layout } = /** @type {ComputePipelineDescriptor} */ (moduleDescriptor);

        label ??= /*@__INLINE__*/ this.CreatePipelineLabel("Compute Pipeline");
        layout ??= "auto";

        return this.GPUPipeline = await this.Device.createComputePipelineAsync({
            label, layout, compute: { module, ...moduleDescriptor }
        });
    }
}
