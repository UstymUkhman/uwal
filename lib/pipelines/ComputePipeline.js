import { BasePipeline } from "@/pipelines";

export default class ComputePipeline extends BasePipeline
{
    /** @type {number[]} */ #Workgroups = [1];

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [programName = ""]
     */
    constructor(device, programName)
    {
        super(device, programName, "Compute");
    }

    /**
     * @param {string} [label = undefined]
     * @param {GPUQuerySet} [querySet = undefined]
     * @param {GPUSize32} [beginningOfPassWriteIndex = undefined]
     * @param {GPUSize32} [endOfPassWriteIndex = undefined]
     */
    CreatePassDescriptor(label, querySet, beginningOfPassWriteIndex, endOfPassWriteIndex)
    {
        label ??= this.CreateProgramLabel("Compute Pass");

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
     * @property {string} [label = undefined]
     * @property {string} [entryPoint = undefined]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {Record<string, GPUPipelineConstantValue>} [constants = undefined]
     * @param {ComputePipelineDescriptor} descriptor
     */
    CreatePipeline(descriptor)
    {
        const layout = descriptor.layout ?? "auto";
        const label = descriptor.label ?? this.CreateProgramLabel("Compute Pipeline");
        return this.Pipeline = this.Device.createComputePipeline({ label, layout, compute: descriptor });
    }

    /** @param {GPUComputePipeline} pipeline */
    SetPipeline(pipeline)
    {
        this.Pipeline = pipeline;
    }

    Compute()
    {
        const computePass = this.GetCommandEncoder().beginComputePass(this.Descriptor);
        computePass.setPipeline(/** @type {GPUComputePipeline} */ (this.Pipeline));

        for (let g = 0, a = 0, l = this.BindGroups.length; g < l; ++g)
        {
            const { bindGroup, dynamicOffsets, active } = this.BindGroups[g];
            active && computePass.setBindGroup(a++, bindGroup, dynamicOffsets);
        }

        // @ts-ignore
        computePass.dispatchWorkgroups(...this.#Workgroups);

        computePass.end();
    }

    /** @param {number | number[]} workgroups */
    set Workgroups(workgroups)
    {
        this.#Workgroups = (/** @type {number[]} */ (Array.isArray(workgroups) && workgroups || [workgroups]));
    }
}
