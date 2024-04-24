import { Base } from "@/pipeline";

export default class ComputePipeline extends Base
{
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
     * @param {GPUCommandEncoder} encoder
     * @param {GPUComputePipeline} pipeline
     * @param {number | number[]} workgroups
     * @param {GPUBindGroup | GPUBindGroup[]} [bindGroups = []]
     * @param {GPUComputePassDescriptor} [descriptor = undefined]
     */
    Compute(encoder, pipeline, workgroups, bindGroups = [], descriptor)
    {
        bindGroups = Array.isArray(bindGroups) ? bindGroups : [bindGroups];
        workgroups = Array.isArray(workgroups) ? workgroups : [workgroups];

        const pass = encoder.beginComputePass(descriptor);
        pass.setPipeline(pipeline);

        for (let g = 0, l = bindGroups.length; g < l; ++g)
            pass.setBindGroup(g, bindGroups[g]);

        // @ts-ignore
        pass.dispatchWorkgroups(...workgroups);
        pass.end();
    }
}
