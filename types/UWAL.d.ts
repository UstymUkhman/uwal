export default class UWAL {
    /** @type {GPUDevice | null} */ static "__#5@#Device": GPUDevice | null;
    /** @type {GPUAdapter | null} */ static "__#5@#Adapter": GPUAdapter | null;
    /** @type {GPURequestAdapterOptions} */ static "__#5@#AdapterOptions": GPURequestAdapterOptions;
    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnDeviceLost: ((detail: GPUDeviceLostInfo) => unknown) | undefined;
    /** @type {GPUDeviceDescriptor & { requiredFeatures?: GPUFeatureName[]; }} */ static "__#5@#DeviceDescriptor": GPUDeviceDescriptor & {
        requiredFeatures?: GPUFeatureName[];
    };
    /** @param {string} [programName = ""] */
    static "__#5@#SetDeviceDescriptorLabel"(programName?: string | undefined): void;
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} [programName = ""]
     * @param {ConfigurationOptions} [options = {}]
     *
     * @returns {Promise<Renderer>}
     */
    static RenderPipeline(canvas: HTMLCanvasElement, programName?: string | undefined, options?: ConfigurationOptions | undefined): Promise<Renderer>;
    /**
     * @param {string} [programName = ""]
     *
     * @returns {Promise<Computation>}
     */
    static ComputePipeline(programName?: string | undefined): Promise<Computation>;
    /**
     * @param {Renderer} [renderer]
     *
     * @returns {Promise<import("./textures/Texture").default>}
     */
    static Texture(renderer?: import("./pipelines/RenderPipeline").default | undefined): Promise<import("./textures/Texture").default>;
    /**
     * @param {GPUBuffer | GPUBuffer[]} [buffers]
     * @param {GPUTexture | GPUTexture[]} [textures]
     * @param {GPUQuerySet | GPUQuerySet[]} [querySets]
     */
    static Destroy(buffers?: GPUBuffer | GPUBuffer[], textures?: GPUTexture | GPUTexture[], querySets?: GPUQuerySet | GPUQuerySet[]): void;
    /** @param {GPUDeviceLostInfo} detail */
    static "__#5@#DeviceLost"(detail: GPUDeviceLostInfo): unknown;
    static "__#5@#RequestAdapter"(): () => Promise<any>;
    static "__#5@#RequestDevice"(): () => Promise<any>;
    /** @param {GPUPowerPreference} powerPreference */
    static set PowerPreference(powerPreference: GPUPowerPreference);
    /** @param {boolean} forceFallbackAdapter */
    static set ForceFallbackAdapter(forceFallbackAdapter: boolean);
    /** @param {string} label */
    static set DescriptorLabel(label: string);
    /** @param {GPUFeatureName | GPUFeatureName[]} features */
    static SetRequiredFeatures(features: GPUFeatureName | GPUFeatureName[]): Promise<any>;
    /** @param {Record<string, GPUSize64>} requiredLimits */
    static set RequiredLimits(requiredLimits: Record<string, GPUSize64>);
    static get PreferredCanvasFormat(): any;
    static get Adapter(): Promise<any>;
    static get Device(): Promise<any>;
    static get VERSION(): any;
}
export type CanvasConfiguration = Omit<GPUCanvasConfiguration, "device">;
export type Computation = import("./pipelines/ComputePipeline").default;
export type Renderer = import("./pipelines/RenderPipeline").default;
export type ConfigurationOptions = Pick<Partial<CanvasConfiguration>, "format"> & Omit<CanvasConfiguration, "format">;
//# sourceMappingURL=UWAL.d.ts.map