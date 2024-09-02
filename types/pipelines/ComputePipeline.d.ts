export default class ComputePipeline {
    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     */
    constructor(device?: any, programName?: string | undefined);
    /**
     * @param {string} [label]
     * @param {GPUQuerySet} [querySet]
     * @param {GPUSize32} [beginningOfPassWriteIndex]
     * @param {GPUSize32} [endOfPassWriteIndex]
     */
    CreatePassDescriptor(label?: string | undefined, querySet?: any, beginningOfPassWriteIndex?: any, endOfPassWriteIndex?: any): {
        label: string | undefined;
        timestampWrites: {
            querySet: any;
            beginningOfPassWriteIndex: any;
            endOfPassWriteIndex: any;
        } | undefined;
    };
    Descriptor: any;
    /** @param {GPUComputePassDescriptor} descriptor */
    SetPassDescriptor(descriptor: GPUComputePassDescriptor): void;
    /**
     * @typedef {Object} ComputePipelineDescriptor
     * @property {GPUShaderModule} [module]
     * @property {string} [label]
     * @property {string} [entryPoint]
     * @property {GPUPipelineLayout | GPUAutoLayoutMode} [layout = "auto"]
     * @property {Record<string, GPUPipelineConstantValue>} [constants]
     *
     * @param {ComputePipelineDescriptor | GPUShaderModule} [moduleDescriptor]
     */
    CreatePipeline(moduleDescriptor?: {
        module?: any;
        label?: string | undefined;
        entryPoint?: string | undefined;
        layout?: GPUPipelineLayout | GPUAutoLayoutMode;
        constants?: Record<string, GPUPipelineConstantValue> | undefined;
    } | GPUShaderModule): any;
    Pipeline: any;
    /** @param {boolean} [submit = false] */
    Compute(submit?: boolean | undefined): void;
    Submit(): void;
    /** @param {number | number[]} workgroups */
    set Workgroups(workgroups: number | number[]);
    #private;
}
//# sourceMappingURL=ComputePipeline.d.ts.map