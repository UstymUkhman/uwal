import { GetShaderModule, GetParamArray } from "#/utils";
import { ComputePipeline } from "#/pipelines";
import { BaseStage } from "#/stages";

/**
 * @typedef {ShaderCode             |
 *           GPUShaderModule        |
 *           ShaderModuleDescriptor |
 *           ComputePipelineDescriptor
 * } NewComputePipelineDescriptor
 *
 * @exports NewComputePipelineDescriptor
 */

export default class ComputeStage extends BaseStage
{
    /**
     * @typedef {[number, number?, number?]} Workgroups
     * @typedef {import("../pipelines/BasePipeline").ShaderCode} ShaderCode
     * @typedef {import("../pipelines/ComputePipeline").ComputePipelineInstance} Pipeline
     * @typedef {import("../pipelines/BasePipeline").ShaderModuleDescriptor} ShaderModuleDescriptor
     * @typedef {import("../pipelines/ComputePipeline").ComputePipelineDescriptor & {
     *     pipelineName?: string;
     * }} ComputePipelineDescriptor
     */

    /** @type {Workgroups} */ #Workgroups = [1, void 0, void 0];
    /** @type {GPUComputePassDescriptor} */ #Descriptor = {};

    /**
     * @param {GPUDevice} device
     * @param {string} [name = ""]
     */
    constructor(device, name)
    {
        super(device, "Compute", name);
        this.CreatePassDescriptor();
    }

    /**
     * @param {string} [label]
     * @param {GPUComputePassTimestampWrites} [timestampWrites]
     * @returns {GPUComputePassDescriptor}
     */
    CreatePassDescriptor(label, timestampWrites)
    {
        label ??= /*@__INLINE__*/ this.CreateStageLabel("Compute Pass");
        return this.#Descriptor = { label, timestampWrites };
    }

    /**
     * @description Given the number of `@workgroup_size` dimensions in input, checks
     * `GPUDevice.limits.maxComputeInvocationsPerWorkgroup` and returns the maximum EVEN size each dimension can have.
     * JS example: `const size = GetMaxEvenWorkgroupDimension(2);` and in WGSL: `@compute @workgroup_size(size, size)`.
     * @param {1 | 2 | 3} [dimensions = 1]
     */
    GetMaxEvenWorkgroupDimension(dimensions = 1)
    {
        const { maxComputeInvocationsPerWorkgroup } = this.Device.limits;

        return (dimensions === 3
            ? Math.cbrt(maxComputeInvocationsPerWorkgroup) : dimensions === 2
            ? Math.sqrt(maxComputeInvocationsPerWorkgroup) : maxComputeInvocationsPerWorkgroup) | 0;
    }

    /** @param {NewComputePipelineDescriptor} moduleDescriptor */
    async CreatePipeline(moduleDescriptor)
    {
        const shaderModule = Array.isArray(moduleDescriptor) || typeof moduleDescriptor === "string";
        const Pipeline = new this.Pipeline(/** @type {ComputePipelineDescriptor} */ (moduleDescriptor).pipelineName);

        moduleDescriptor = GetShaderModule(/** @type {GPUShaderModule | ComputePipelineDescriptor} */ (moduleDescriptor))
            ?? ((shaderModule || (typeof moduleDescriptor === "object" && "shader" in moduleDescriptor))
            && Pipeline.CreateShaderModule(...Object.values(shaderModule && [moduleDescriptor] || moduleDescriptor))
            || /** @type {GPUShaderModule} */ (moduleDescriptor));

        return await this.AddPipeline(Pipeline, moduleDescriptor);
    }

    /**
     * @param {Pipeline} Pipeline
     * @param {GPUShaderModule | ComputePipelineDescriptor} [moduleDescriptor]
     */
    async AddPipeline(Pipeline, moduleDescriptor)
    {
        await /** @type {ComputePipeline} */ (Pipeline).Init(moduleDescriptor, this.Pipelines.length);
        this.Pipelines.push(Pipeline);
        return Pipeline;
    }

    /**
     * @param {Pipeline} Pipeline
     * @param {GPUComputePassEncoder} computePass
     */
    #UsePipeline(Pipeline, computePass)
    {
        computePass.setPipeline(/** @type {GPUComputePipeline} */ (Pipeline.GPUPipeline));

        Pipeline.UseBindGroups(computePass);

        computePass.dispatchWorkgroups(...this.#Workgroups);

        computePass.end();
    }

    /**
     * @param {boolean} [submit = true] - Complete recording of the commands sequence (`GPUCommandEncoder.finish()`)
     * and schedule the execution of the command buffers by the GPU on this queue (`GPUQueue.submit()`) after the last
     * pipeline's workgroups have been dispatched.
     */
    Compute(submit = true)
    {
        const pl = this.Pipelines.length;

        const computePass = this.GetCommandEncoder().beginComputePass(this.#Descriptor);

        if (!(pl - 1) && this.Pipelines[0].Active)
            // Save some instructions if there's only one active pipeline:
            this.#UsePipeline(this.Pipelines[0], computePass);

        else
            for (let p = 0; p < pl; ++p)
            {
                const Pipeline = /** @type {Pipeline} */ (this.Pipelines[p]);
                Pipeline.Active && this.#UsePipeline(Pipeline, computePass);
            }

        submit && this.Submit();
    }

    Submit()
    {
        this.SubmitCommandBuffer();
        this.CommandEncoder = undefined;
    }

    /** @param {number | Workgroups} workgroups */
    set Workgroups(workgroups)
    {
        this.#Workgroups = /** @type {Workgroups} */ (GetParamArray(workgroups).map(w => Math.ceil(w ?? 0)));
    }

    get Pipeline()
    {
        const { Name, Device } = this;

        return /** @type {Pipeline & { new(name?: string): Pipeline }} */ (
            /** @type {unknown} */ (class extends ComputePipeline
            {
                constructor(name = Name)
                {
                    super(Device, name);
                }
            })
        );
    }

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.Workgroups = 1;
    }
}
