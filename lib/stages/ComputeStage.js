import BaseStage from "./BaseStage";
import { GetParamArray } from "#/utils";
import { ComputePipeline } from "#/pipelines";

export default class ComputeStage extends BaseStage
{
    /** @type {number[]} */ #Workgroups = [1];
    /** @type {GPUComputePassDescriptor} */ #Descriptor;

    /** @typedef {import("../pipelines/ComputePipeline").ComputePipelineDescriptor} ComputePipelineDescriptor */

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
     * @param {ComputePipeline} Pipeline
     * @param {ComputePipelineDescriptor | GPUShaderModule} [moduleDescriptor]
     */
    async AddPipeline(Pipeline, moduleDescriptor)
    {
        await Pipeline.Init(moduleDescriptor);

        // Prevent resetting an already stored pipeline:
        Reflect.deleteProperty(Pipeline, "Init");

        this.Pipelines.push(Pipeline);
    }

    /**
     * @param {GPUComputePassEncoder} currentPass
     * @param {ComputePipeline} Pipeline
     */
    #UsePipeline(currentPass, Pipeline)
    {
        const bindGroups = Pipeline.BindGroups;
        currentPass.setPipeline(Pipeline.GPUPipeline);

        for (let g = 0, a = 0, gl = bindGroups.length; g < gl; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = bindGroups[g];
            active && currentPass.setBindGroup(a++, bindGroup, dynamicOffsets);
        }

        currentPass.dispatchWorkgroups(...this.#Workgroups);
    }

    /** @param {boolean} [submit = false] */
    Compute(submit = false)
    {
        const currentPass = this.GetCommandEncoder().beginComputePass(this.#Descriptor);

        const pl = this.Pipelines.length;

        if (!(pl - 1) && this.Pipelines[0].Active)
        {
            // Save some instructions if there's only one active pipeline:
            this.#UsePipeline(currentPass, this.Pipelines[0]);
        }
        else
        {
            for (let p = 0; p < pl; ++p)
            {
                const Pipeline = /** @type {ComputePipeline} */ (this.Pipelines[p]);
                Pipeline.Active && this.#UsePipeline(currentPass, Pipeline);
            }
        }

        currentPass.end();
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
