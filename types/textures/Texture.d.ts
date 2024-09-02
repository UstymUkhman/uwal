export default class Texture {
    /**
     * @param {GPUDevice} [device]
     * @param {Renderer} [renderer]
     */
    constructor(device?: any, renderer?: any);
    /** @param {Renderer} renderer */
    set Renderer(renderer: Renderer);
    /** @param {GPUTextureDescriptor} descriptor */
    CreateTexture(descriptor: GPUTextureDescriptor): any;
    /**
     * @typedef {GPUImageCopyTexture & GPUImageDataLayout & OptionalGPUExtent3DStrict} WriteOptions
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {WriteOptions} options
     */
    WriteTexture(data: BufferSource | SharedArrayBuffer, options: any): void;
    /**
     * @param {ImageBitmapSource} image
     * @param {ImageBitmapOptions} [options]
     */
    CreateBitmapImage(image: ImageBitmapSource, options?: ImageBitmapOptions | undefined): Promise<ImageBitmap>;
    /**
     * @typedef {Partial<GPUTextureDescriptor> & { mipmaps?: boolean }} TextureDescriptor
     * @param {GPUImageCopyExternalImageSource | GPUTexture} source
     * @param {TextureDescriptor | boolean} [options = { mipmaps: true, format: "rgba8unorm", usage: USAGE.RENDER }]
     */
    CreateTextureFromSource(source: GPUImageCopyExternalImageSource | GPUTexture, options?: any | boolean): any;
    /**
     * @param {HTMLVideoElement | VideoFrame} source
     * @param {string} [label]
     * @param {PredefinedColorSpace} [colorSpace]
     */
    ImportExternalTexture(source: HTMLVideoElement | VideoFrame, label?: string | undefined, colorSpace?: PredefinedColorSpace | undefined): any;
    /**
     * @param {boolean} [force = false]
     * @param {number} [sampleCount = 4]
     * @param {string} [label = "Multisample Texture"]
     */
    CreateMultisampleTexture(force?: boolean | undefined, sampleCount?: number | undefined, label?: string | undefined): GPUTexture;
    /**
     * @typedef {OptionalGPUExtent3DStrict & {
     *     create?: TextureDescriptor | boolean;
     *     colorSpace?: PredefinedColorSpace;
     *     sourceOrigin?: GPUOrigin2DStrict;
     *     destinationOrigin?: GPUOrigin3D;
     *     mipLevel?: GPUIntegerCoordinate;
     *     premultipliedAlpha?: boolean;
     *     aspect?: GPUTextureAspect;
     *     generateMipmaps?: boolean;
     *     texture?: GPUTexture;
     *     flipY?: boolean;
     * }} CopyOptions
     *
     * @param {GPUImageCopyExternalImageSource} source
     * @param {CopyOptions} [options = { create: true, generateMipmaps: true }]
     */
    CopyImageToTexture(source: GPUImageCopyExternalImageSource, options?: any): any;
    /** @param {GPUTexture} texture */
    GenerateCubeMipmaps(texture: GPUTexture): void;
    /** @param {GPUTexture} texture */
    GenerateMipmaps(texture: GPUTexture): void;
    /**
     * @typedef {ADDRESS[keyof ADDRESS]} Address
     * @typedef {FILTER[keyof FILTER]} Filter
     * @typedef {GPUSamplerDescriptor & {
     *     addressModeUV?: Address;
     *     addressMode?: Address;
     *     minMagFilter?: Filter;
     *     filter?: Filter;
     * }} SamplerDescriptor
     *
     * @param {SamplerDescriptor} [descriptor]
     */
    CreateSampler(descriptor?: any): any;
    /** @param {GPUImageCopyExternalImageSource | GPUTexture} source */
    GetMipmapLevels(source: GPUImageCopyExternalImageSource | GPUTexture): number;
    /**
     * @deprecated Pass `Renderer` instance to the `Texture` constructor or use `Texture.Renderer` setter instead.
     * @param {Renderer} renderer
     */
    SetRenderer(renderer: Renderer): void;
    #private;
}
//# sourceMappingURL=Texture.d.ts.map