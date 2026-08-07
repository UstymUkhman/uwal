import { ERROR, ThrowWarning } from "#/Errors";
import { GetShaderModule } from "#/utils";
import Pipeline from "./Pipeline";

let ID = 0;

/**
 * @typedef {Omit<import("./Pipeline").default & ComputePipeline, "Init">} ComputePipelineInstance
 *
 * @typedef {import("./Pipeline").PipelineDescriptor & {
 *   entryPoint?: string;
 *   constants?: Record<string, GPUPipelineConstantValue>;
 * }} ComputePipelineDescriptor
 *
 * @exports ComputePipelineInstance, ComputePipelineDescriptor
 */

export default class ComputePipeline extends Pipeline
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
     * @hidden
     * @throws `ERROR.INVALID_CALL` if called manually.
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
