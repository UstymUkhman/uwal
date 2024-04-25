import { BasePipeline } from "@/pipeline";

export default class ComputePipeline extends BasePipeline
{
    /** @type {number[]} */ #Workgroups = [1];

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [commandEncoderLabel = ""]
     */
    constructor(device, commandEncoderLabel)
    {
        super(device, commandEncoderLabel);
    }

    /**
     * @param {string} [label = ""]
     * @param {GPUQuerySet} [querySet = undefined]
     * @param {GPUSize32} [beginningOfPassWriteIndex = undefined]
     * @param {GPUSize32} [endOfPassWriteIndex = undefined]
     */
    CreateComputePassDescriptor(label = "", querySet, beginningOfPassWriteIndex, endOfPassWriteIndex)
    {
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
     * @property {string} [entry = "compute"]
     * @property {string} [label = undefined]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {Record<string, GPUPipelineConstantValue>} [constants = undefined]
     * @param {ComputePipelineDescriptor} descriptor
     */
    CreateComputePipeline(descriptor)
    {
        const layout = descriptor.layout ?? "auto";
        return this.Device.createComputePipeline({ label: descriptor.label, layout, compute: descriptor });
    }

    /**
     * @param {GPUComputePipeline} pipeline
     * @param {GPUComputePassDescriptor} [descriptor = undefined]
     */
    Compute(pipeline, descriptor)
    {
        this.CheckCommandEncoder();
        const pass = this.CommandEncoder.beginComputePass(descriptor);

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
        this.#Workgroups = Array.isArray(workgroups) ? workgroups : [workgroups];
    }
}
