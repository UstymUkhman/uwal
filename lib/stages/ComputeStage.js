import BaseStage from "./BaseStage";
import { GetParamArray } from "#/utils";
import { ComputePipeline } from "#/pipelines";

export default class ComputeStage extends BaseStage
{
    /** @type {number[]} */ #Workgroups = [1];
    /** @type {GPUComputePassDescriptor} */ #Descriptor;

    /**
     * @typedef {import("../pipelines/BasePipeline").default} BasePipeline
     * @typedef {import("../pipelines/ComputePipeline").default} ComputePipeline
     * @typedef {Omit<BasePipeline & ComputePipeline, "Init">} ComputePipelineInstance
     * @typedef {ComputePipelineInstance & { new(): ComputePipelineInstance }} ProxyComputePipeline
     * @typedef {import("../pipelines/ComputePipeline").ComputePipelineDescriptor} ComputePipelineDescriptor
     */

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

    /** @param {GPUShaderModule | ComputePipelineDescriptor} [moduleDescriptor] */
    async CreatePipeline(moduleDescriptor)
    {
        const Pipeline = new this.Pipeline();
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
        this.#Workgroups = /** @type {number[]} */ (GetParamArray(workgroups));
    }

    /** @returns {ProxyComputePipeline} */
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
