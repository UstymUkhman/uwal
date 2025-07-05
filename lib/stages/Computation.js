import { BaseStage } from "#/stages";
import { GetParamArray } from "#/utils";
import { ComputePipeline } from "#/pipelines";

export default class Computation extends BaseStage
{
    /** @type {number[]} */ #Workgroups = [1];
    /** @type {GPUComputePassDescriptor} */ #Descriptor;

    /** @typedef {import("../pipelines/ComputePipeline").ComputePipelineDescriptor} ComputePipelineDescriptor */

    /**
     * @param {GPUDevice} device
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        super(device, programName);
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

    /** @param {ComputePipelineDescriptor | GPUShaderModule} [moduleDescriptor] */
    async CreatePipeline(moduleDescriptor)
    {
        const Pipeline = new ComputePipeline(this.Device, this.ProgramName);
        await Pipeline.Init(moduleDescriptor);

        // Prevent resetting an already stored pipeline:
        Reflect.deleteProperty(Pipeline, "Init");

        this.Pipelines.push(Pipeline);
        return Pipeline;
    }

    /** @param {boolean} [submit = false] */
    Compute(submit = false)
    {
        const currentPass = this.GetCommandEncoder().beginComputePass(this.#Descriptor);

        for (let p = 0, pl = this.Pipelines.length; p < pl; ++p)
        {
            const Pipeline = /** @type {ComputePipeline} */ (this.Pipelines[p]);

            if (!Pipeline.Active) continue;

            const bindGroups = Pipeline.BindGroups;
            currentPass.setPipeline(Pipeline.GPUPipeline);

            for (let g = 0, a = 0, gl = bindGroups.length; g < gl; ++g)
            {
                const { bindGroup, dynamicOffsets, active } = bindGroups[g];
                active && currentPass.setBindGroup(a++, bindGroup, dynamicOffsets);
            }

            currentPass.dispatchWorkgroups(...this.#Workgroups);
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

    /** @override */
    Destroy()
    {
        super.Destroy();
        this.Workgroups = 1;
    }
}
