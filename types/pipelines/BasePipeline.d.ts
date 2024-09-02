/**
 * @typedef {Float32Array | Uint32Array | Int32Array} TypedArray
 * @typedef {{ [name: string]: LayoutView }} UniformLayout
 * @typedef {TypedArray | UniformLayout | UniformLayout[]} LayoutView
 * @exports UniformLayout
 */
/** @abstract */ export default class BasePipeline {
    /**
     * @param {GPUDevice} [device]
     * @param {string} [programName = ""]
     * @param {string} [type = ""]
     */
    constructor(device?: any, programName?: string | undefined, type?: string | undefined);
    /** @protected @type {GPUDevice} */ protected Device: GPUDevice;
    /** @protected @type {BindGroup[]} */ protected BindGroups: {
        bindGroup: GPUBindGroup;
        dynamicOffsets?: GPUBufferDynamicOffset[] | undefined;
        active: boolean;
    }[];
    /** @protected @type {WgslReflect | undefined} */ protected Reflect: WgslReflect | undefined;
    /** @protected @type {GPURenderPipeline | GPUComputePipeline} */ protected Pipeline: GPURenderPipeline | GPUComputePipeline;
    /** @protected @type {GPURenderPassDescriptor | GPUComputePassDescriptor} */ protected Descriptor: GPURenderPassDescriptor | GPUComputePassDescriptor;
    /** @protected @param {string} [label = ""] */
    protected CreatePipelineLabel(label?: string | undefined): string;
    /**
     * @param {GPUBindGroupLayout | GPUBindGroupLayout[]} layouts
     * @param {string} [label]
     */
    CreatePipelineLayout(layouts: GPUBindGroupLayout | GPUBindGroupLayout[], label?: string | undefined): any;
    /**
     * @param {string | string[]} [shader]
     * @param {string} [label]
     * @param {any} [sourceMap]
     * @param {GPUShaderModuleCompilationHint[]} [hints]
     */
    CreateShaderModule(shader?: string | string[] | undefined, label?: string | undefined, sourceMap?: any, hints?: GPUShaderModuleCompilationHint[] | undefined): any;
    /**
     * @protected
     * @typedef {{ module?: GPUShaderModule }} PipelineDescriptor
     * @param {GPUShaderModule | PipelineDescriptor} moduleDescriptor
     */
    protected GetShaderModule(moduleDescriptor: GPUShaderModule | {
        module?: any;
    }): any;
    /** @param {string} uniformName */
    CreateUniformBufferLayout(uniformName: string): LayoutView;
    /**
     * @typedef {Object} BufferDescriptor
     * @property {GPUSize64} size
     * @property {GPUBufferUsageFlags} usage
     * @property {string} [label]
     * @property {boolean} [mappedAtCreation]
     * @param {BufferDescriptor} descriptor
     */
    CreateBuffer(descriptor: {
        size: GPUSize64;
        usage: GPUBufferUsageFlags;
        label?: string | undefined;
        mappedAtCreation?: boolean | undefined;
    }): any;
    /**
     * @param {GPUBuffer} buffer
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {GPUSize64} [bufferOffset = 0]
     * @param {GPUSize64} [dataOffset]
     * @param {GPUSize64} [size]
     */
    WriteBuffer(buffer: GPUBuffer, data: BufferSource | SharedArrayBuffer, bufferOffset?: any, dataOffset?: any, size?: any): void;
    /**
     * @param {GPUBuffer} source
     * @param {GPUBuffer} destination
     * @param {GPUSize64} size
     * @param {GPUSize64} [sourceOffset = 0]
     * @param {GPUSize64} [destinationOffset = 0]
     */
    CopyBufferToBuffer(source: GPUBuffer, destination: GPUBuffer, size: GPUSize64, sourceOffset?: any, destinationOffset?: any): void;
    /**
     * @typedef {
           Pick<Partial<GPUBindGroupLayoutEntry>, "binding"> &
           Omit<GPUBindGroupLayoutEntry, "binding">
       } BindGroupLayoutEntry
     * @param {BindGroupLayoutEntry | BindGroupLayoutEntry[]} layoutEntries
     * @param {string} [label]
     */
    CreateBindGroupLayout(layoutEntries: (Pick<GPUBindGroupLayoutEntry, "binding"> & Omit<GPUBindGroupLayoutEntry, "binding">) | (Pick<GPUBindGroupLayoutEntry, "binding"> & Omit<GPUBindGroupLayoutEntry, "binding">)[], label?: string | undefined): any;
    /**
     * @param {GPUBindingResource | GPUBindingResource[]} resources
     * @param {GPUIndex32 | GPUIndex32[]} [bindings = 0]
     */
    CreateBindGroupEntries(resources: GPUBindingResource | GPUBindingResource[], bindings?: GPUIndex32 | GPUIndex32[]): GPUBindGroupEntry[];
    /**
     * @param {GPUBindGroupEntry[]} entries
     * @param {GPUBindGroupLayout | number} [layout = 0]
     * @param {string} [label]
     */
    CreateBindGroup(entries: GPUBindGroupEntry[], layout?: GPUBindGroupLayout | number, label?: string | undefined): any;
    /**
     * @param {GPUBindGroup | GPUBindGroup[]} bindGroups
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    SetBindGroups(bindGroups: GPUBindGroup | GPUBindGroup[], dynamicOffsets?: GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]): void;
    /**
     * @param {GPUBindGroup | GPUBindGroup[]} bindGroups
     * @param {GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]} [dynamicOffsets]
     */
    AddBindGroups(bindGroups: GPUBindGroup | GPUBindGroup[], dynamicOffsets?: GPUBufferDynamicOffset | GPUBufferDynamicOffset[] | GPUBufferDynamicOffset[][]): number;
    /** @param {number | number[]} indices */
    SetActiveBindGroups(indices: number | number[]): void;
    ClearBindGroups(): void;
    CreateCommandEncoder(): any;
    /** @param {GPUCommandEncoder} [commandEncoder] */
    SetCommandEncoder(commandEncoder?: any): void;
    /** @protected @param {boolean} [required = false] */
    protected GetCommandEncoder(required?: boolean | undefined): any;
    SubmitCommandBuffer(): void;
    /** @protected */
    protected SavePipelineState(): void;
    /** @protected */
    protected ResetPipelineState(): void;
    /** @protected */
    protected RestorePipelineState(): void;
    /** @param {string} label */
    set CommandEncoderLabel(label: string);
    /** @protected */
    protected get ProgramName(): string;
    #private;
}
export type TypedArray = Float32Array | Uint32Array | Int32Array;
export type UniformLayout = {
    [name: string]: LayoutView;
};
export type LayoutView = TypedArray | UniformLayout | UniformLayout[];
import { WgslReflect } from "wgsl_reflect";
//# sourceMappingURL=BasePipeline.d.ts.map