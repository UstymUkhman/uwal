import { BasePipeline } from "@/pipelines";

export default class ComputePipeline extends BasePipeline
{
    /** @type {number[]} */ #Workgroups = [1];

    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        super(device, programName, "Compute");
    }

    /**
     * @param {string} [label]
     * @param {GPUQuerySet} [querySet]
     * @param {GPUSize32} [beginningOfPassWriteIndex]
     * @param {GPUSize32} [endOfPassWriteIndex]
     */
    CreatePassDescriptor(label, querySet, beginningOfPassWriteIndex, endOfPassWriteIndex)
    {
        label ??= this.CreatePipelineLabel("Compute Pass");

        return this.Descriptor =
        {
            label, timestampWrites: querySet ? { querySet, beginningOfPassWriteIndex, endOfPassWriteIndex } : undefined
        };
    }

    /** @param {GPUComputePassDescriptor} descriptor */
    SetPassDescriptor(descriptor)
    {
        this.Descriptor = descriptor;
    }

    /**
     * @typedef {Object} ComputePipelineDescriptor
     * @property {GPUShaderModule} module
     * @property {string} [label]
     * @property {string} [entryPoint]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {Record<string, GPUPipelineConstantValue>} [constants]
     * @param {ComputePipelineDescriptor} descriptor
     */
    CreatePipeline(descriptor)
    {
        const layout = descriptor.layout ?? "auto";
        const label = descriptor.label ?? this.CreatePipelineLabel("Compute Pipeline");
        return this.Pipeline = this.Device.createComputePipeline({ label, layout, compute: descriptor });
    }

    /** @param {boolean} [submit = false] */
    Compute(submit = false)
    {
        const currentPass = this.GetCommandEncoder().beginComputePass(this.Descriptor);
        currentPass.setPipeline(/** @type {GPUComputePipeline} */ (this.Pipeline));

        for (let g = 0, a = 0, l = this.BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.BindGroups[g];
            active && currentPass.setBindGroup(a++, bindGroup, dynamicOffsets);
        }

        // @ts-ignore
        currentPass.dispatchWorkgroups(...this.#Workgroups);

        currentPass.end();

        submit && this.Submit();
    }

    Submit()
    {
        this.SubmitCommandBuffer();
        this.SetCommandEncoder(undefined);
    }

    /** @param {number | number[]} workgroups */
    set Workgroups(workgroups)
    {
        this.#Workgroups = (/** @type {number[]} */ (Array.isArray(workgroups) && workgroups || [workgroups]));
    }
}
