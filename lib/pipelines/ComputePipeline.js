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
        this.CreatePassDescriptor();
    }

    /**
     * @param {string} [label]
     * @param {GPUComputePassTimestampWrites} [timestampWrites]
     */
    CreatePassDescriptor(label, timestampWrites)
    {
        label ??= this.CreatePipelineLabel("Compute Pass");
        return this.Descriptor = { label, timestampWrites };
    }

    /**
     * @todo Convert to a `Promise` in version `0.1.0`.
     *
     * @typedef {Object} ComputePipelineDescriptor
     * @property {GPUShaderModule} [module]
     * @property {string} [label]
     * @property {string} [entryPoint]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {Record<string, GPUPipelineConstantValue>} [constants]
     *
     * @param {ComputePipelineDescriptor | GPUShaderModule} [moduleDescriptor]
     */
    /* async */ CreatePipeline(moduleDescriptor)
    {
        const label = moduleDescriptor.label ?? this.CreatePipelineLabel("Compute Pipeline");
        const layout = /** @type {ComputePipelineDescriptor} */ (moduleDescriptor).layout ?? "auto";
        const module = this.GetShaderModule(moduleDescriptor) ?? this.CreateShaderModule();

        return this.SetPipeline(/* await */ this.Device.createComputePipeline/*Async*/({
            label, layout, compute: { module, ...moduleDescriptor }
        }));
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
