import BaseStage from "./BaseStage";
import { ComputePipeline } from "#/pipelines";
import { GetShaderModule, GetParamArray } from "#/utils";

/**
 * @typedef {ShaderCode | GPUShaderModule | ShaderModuleDescriptor | ComputePipelineDescriptor & {
       pipelineName?: string;
 * }} NewComputePipelineDescriptor
 * @exports NewComputePipelineDescriptor
 */

export default class ComputeStage extends BaseStage
{
    /**
     * @typedef {import("../pipelines/ComputePipeline").ComputePipelineDescriptor} ComputePipelineDescriptor
     * @typedef {import("../pipelines/BasePipeline").ShaderModuleDescriptor} ShaderModuleDescriptor
     * @typedef {import("../pipelines/BasePipeline").ShaderCode} ShaderCode
     */

    /** @type {number[]} */ #Workgroups = [1];
    /** @type {GPUComputePassDescriptor} */ #Descriptor;

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
     */
    CreatePassDescriptor(label, timestampWrites)
    {
        label ??= this.CreateStageLabel("Compute Pass");
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
        const shaderModuleDescriptor = shaderModule || "shader" in moduleDescriptor;
        const Pipeline = new this.Pipeline(moduleDescriptor.pipelineName);

        moduleDescriptor = GetShaderModule(moduleDescriptor) ?? (shaderModuleDescriptor && Pipeline.CreateShaderModule(
            ...Object.values(shaderModule && [moduleDescriptor] || moduleDescriptor)
        ) || moduleDescriptor);

        await this.AddPipeline(Pipeline, moduleDescriptor);
        return Pipeline;
    }

    /**
     * @param {ComputePipeline} Pipeline
     * @param {GPUShaderModule | ComputePipelineDescriptor} [moduleDescriptor]
     */
    async AddPipeline(Pipeline, moduleDescriptor)
    {
        await Pipeline.Init(moduleDescriptor);

        // Prevent resetting an already stored pipeline:
        Reflect.deleteProperty(Pipeline, "Init");

        this.Pipelines.push(Pipeline);
        return Pipeline;
    }

    /**
     * @param {GPUComputePassEncoder} computePass
     * @param {ComputePipeline} Pipeline
     */
    #UsePipeline(computePass, Pipeline)
    {
        computePass.setPipeline(Pipeline.GPUPipeline);

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
        const computePass = this.GetCommandEncoder().beginComputePass(this.#Descriptor);

        const pl = this.Pipelines.length;

        if (!(pl - 1) && this.Pipelines[0].Active)
        {
            // Save some instructions if there's only one active pipeline:
            this.#UsePipeline(computePass, this.Pipelines[0]);
        }
        else
        {
            for (let p = 0; p < pl; ++p)
            {
                const Pipeline = /** @type {ComputePipeline} */ (this.Pipelines[p]);
                Pipeline.Active && this.#UsePipeline(computePass, Pipeline);
            }
        }

        submit && this.Submit();
    }

    Submit()
    {
        this.SubmitCommandBuffer();
        this.CommandEncoder = undefined;
    }

    /** @param {number | number[]} workgroups */
    set Workgroups(workgroups)
    {
        this.#Workgroups = /** @type {number[]} */ (GetParamArray(workgroups)).map(Math.ceil);
    }

    /**
     * @typedef {import("../pipelines/ComputePipeline").ComputePipeline} ComputePipeline
     * @returns {ComputePipeline & { new(): ComputePipeline }}
     */
    get Pipeline()
    {
        const { Name, Device } = this;

        return class extends ComputePipeline
        {
            constructor(name = Name)
            {
                super(Device, name);
            }
        };
    }

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.Workgroups = 1;
    }
}
