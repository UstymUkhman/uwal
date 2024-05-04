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
    CreateComputePassDescriptor(label, querySet, beginningOfPassWriteIndex, endOfPassWriteIndex)
    {
        label ??= this.CreateProgramLabel("Compute Pass");

        return {
            label,
            timestampWrites: querySet
                ? { querySet, beginningOfPassWriteIndex, endOfPassWriteIndex }
                : undefined
        };
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
    CreateComputePipeline(descriptor)
    {
        const layout = descriptor.layout ?? "auto";
        const label = descriptor.label ?? this.CreateProgramLabel("Compute Pipeline");
        return this.Pipeline = this.Device.createComputePipeline({ label, layout, compute: descriptor });
    }

    /**
     * @param {GPUComputePipeline} pipeline
     * @param {GPUComputePassDescriptor} [descriptor = undefined]
     */
    Compute(pipeline, descriptor)
    {
        const pass = this.GetCommandEncoder().beginComputePass(descriptor);

        pass.setPipeline(pipeline);

        for (let g = 0, l = this.BindGroups.length; g < l; ++g)
            pass.setBindGroup(g, this.BindGroups[g]);

        // @ts-ignore
        pass.dispatchWorkgroups(...this.#Workgroups);
        pass.end();
    }

    /** @param {number | number[]} workgroups */
    set Workgroups(workgroups)
    {
        this.#Workgroups = (/** @type {number[]} */ (Array.isArray(workgroups) && workgroups || [workgroups]));
    }
}
