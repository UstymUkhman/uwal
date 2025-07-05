import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { USAGE, ADDRESS, FILTER } from "./Constants";
import { Mipmaps } from "#/shaders";
import Device from "#/Device";

export default class Texture
{
    /** @type {GPUDevice} */ #Device;
    /** @type {GPUTexture} */ #Multisample;
    /** @type {LegacyRenderer | undefined} */ #Renderer;
    /** @type {GPUSampler | undefined} */ #MipmapsSampler;
    /** @type {GPUShaderModule | undefined} */ #MipmapsModule;

    /**
     * @param {GPUDevice} [device]
     * @param {LegacyRenderer} [renderer]
     */
    constructor(device, renderer)
    {
        !device && ThrowError(ERROR.DEVICE_NOT_REQUESTED);
        this.#Renderer = renderer;
        this.#Device = device;
    }

    /** @param {GPUImageCopyExternalImageSource | GPUTexture} source */
    #GetSourceSize(source)
    {
        return source instanceof HTMLVideoElement
            ? [source.videoWidth, source.videoHeight]
            : source instanceof VideoFrame
            ? [source.codedWidth, source.codedHeight]
            : [source.width, source.height];
    }

    /**
     * @typedef {Partial<GPUExtent3DDict> & { size?: Iterable<GPUIntegerCoordinate> }} OptionalGPUExtent3DStrict
     * @param {OptionalGPUExtent3DStrict} options
     * @param {string} caller
     */
    #GetSizeOptions(options, caller)
    {
        const { size, width, height, depthOrArrayLayers } = options;
        !size && !width && ThrowError(ERROR.TEXTURE_SIZE_NOT_FOUND, `\`${caller}\` method.`);
        return size ?? { width, height, depthOrArrayLayers };
    }

    /**
     * @param {number} bytesPerRow
     * @param {string} caller
     */
    #ValidateBytesPerRow(bytesPerRow, caller)
    {
        const multiple256 = bytesPerRow / 256;
        multiple256 !== (multiple256 | 0) && ThrowWarning(ERROR.INVALID_BYTES_PER_ROW, `\`${caller}\` options.`);
    }

    /**
     * @param {GPUTexture} texture
     * @param {SamplerDescriptor} descriptor
     * @param {(baseMipLevel: number) => void} loop
     */
    #CreateMipmaps(texture, descriptor, loop)
    {
        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "creating a texture with mipmaps.");

        this.#Renderer.SavePipelineState();
        this.#Renderer.ResetPipelineState();

        if (!this.#MipmapsModule || !this.#MipmapsSampler)
        {
            this.#MipmapsModule = this.#Renderer.CreateShaderModule(Mipmaps);
            this.#MipmapsSampler = this.CreateSampler(descriptor);
        }

        this.#Renderer.CreatePipeline(
        {
            vertex: this.#Renderer.CreateVertexState(this.#MipmapsModule),
            fragment: this.#Renderer.CreateFragmentState(
                this.#MipmapsModule,
                void 0,
                this.#Renderer.CreateTargetState(texture.format)
            )
        });

        for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel)
            loop(baseMipLevel);

        this.#Renderer.SubmitCommandBuffer();
        this.#Renderer.SetCommandEncoder(void 0);
        this.#Renderer.RestorePipelineState();

        this.#MipmapsModule = this.#MipmapsSampler = void 0;
    }

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
    CreateSampler(descriptor)
    {
        if (!descriptor) return this.#Device.createSampler();
        const { addressModeUV, addressMode, minMagFilter, filter } = descriptor;

        if (addressModeUV) descriptor.addressModeU = descriptor.addressModeV = addressModeUV;
        if (addressMode) descriptor.addressModeU = descriptor.addressModeV = descriptor.addressModeW = addressMode;

        if (minMagFilter) descriptor.minFilter = descriptor.magFilter = minMagFilter;
        if (filter) descriptor.minFilter = descriptor.magFilter = descriptor.mipmapFilter = filter;

        return this.#Device.createSampler(descriptor);
    }

    /**
     * @param {
           Pick<Partial<GPUTextureDescriptor>, "format"> &
           Pick<Partial<GPUTextureDescriptor>, "usage"> &
           Omit<GPUTextureDescriptor, "format"> &
           Omit<GPUTextureDescriptor, "usage">
       } descriptor
     */
    CreateTexture(descriptor)
    {
        const label = descriptor.label ?? "Texture";
        const { format = "rgba8unorm", usage = USAGE.RENDER } = descriptor;
        return this.#Device.createTexture({ label, format, usage, ...descriptor });
    }

    /**
     * @typedef {GPUImageCopyTexture & GPUImageDataLayout & OptionalGPUExtent3DStrict} WriteOptions
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {WriteOptions} options
     */
    WriteTexture(data, options)
    {
        const { texture, mipLevel, origin, aspect, offset, rowsPerImage } = options;
        const [width, height] = this.#GetSourceSize(texture);
        let { bytesPerRow } = options;

        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;

        this.#Device.queue.writeTexture(
            { texture, mipLevel, origin, aspect },
            data,
            { offset, bytesPerRow, rowsPerImage },
            this.#GetSizeOptions({ width, height, ...options }, "WriteTexture")
        );
    }

    /**
     * @param {
           Pick<Partial<GPUTextureDescriptor>, "format"> &
           Pick<Partial<GPUTextureDescriptor>, "usage"> &
           Pick<Partial<GPUTextureDescriptor>, "size"> &
           Omit<GPUTextureDescriptor, "format"> &
           Omit<GPUTextureDescriptor, "usage" &
           Omit<GPUTextureDescriptor, "size">
       } descriptor
     */
    CreateStorageTexture(descriptor)
    {
        let { size } = descriptor;
        const usage = USAGE.STORAGE | descriptor.usage;
        const label = descriptor.label ?? "Storage Texture";
        const { format = this.PreferredStorageFormat } = descriptor;

        size = this.#Renderer && !size ? this.#Renderer.CanvasSize : size;
        return this.CreateTexture({ label, size, format, ...descriptor, usage });
    }

    /**
     * @param {ImageBitmapSource} image
     * @param {ImageBitmapOptions} [options]
     */
    CreateBitmapImage(image, options)
    {
        return createImageBitmap(image, options);
    }

    /**
     * @typedef {Partial<GPUTextureDescriptor> & { mipmaps?: boolean }} TextureDescriptor
     * @param {GPUImageCopyExternalImageSource | GPUTexture} source
     * @param {TextureDescriptor | boolean} [options = { mipmaps: true, format: "rgba8unorm", usage: USAGE.RENDER }]
     */
    CreateTextureFromSource(source, options = {})
    {
        options = /** @type {TextureDescriptor} */ (typeof options === "boolean" && {} || options);

        const sizeArray = /** @type {Iterable<GPUIntegerCoordinate>} */ (options.size);
        const sizeObject = /** @type {GPUExtent3DDict} */ (options.size);

        const mipLevelCount = options.mipLevelCount ?? (
            ((options.mipmaps ?? true) && this.GetMipmapLevels(source)) || void 0
        );

        const size = Array.isArray(options.size) || !options.size
            ? sizeArray ?? this.#GetSourceSize(source)
            : [sizeObject.width, sizeObject.height];

        return this.CreateTexture({ size, mipLevelCount, ...options });
    }

    /**
     * @param {HTMLVideoElement | VideoFrame} source
     * @param {string} [label]
     * @param {PredefinedColorSpace} [colorSpace]
     */
    ImportExternalTexture(source, label, colorSpace)
    {
        return this.#Device.importExternalTexture({ source, label, colorSpace });
    }

    /**
     * @param {boolean} [force = false]
     * @param {number} [sampleCount = 4]
     * @param {string} [label = "Multisample Texture"]
     */
    CreateMultisampleTexture(force = false, sampleCount = 4, label)
    {
        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "creating a multisample texture.");
        const { width, height, format } = this.#Renderer.CurrentTexture;

        // A new multisample texture needs to be created if `force` flag is used,
        // if it's absent or if its size is different from current canvas texture:
        if (force || !this.#Multisample || this.#Multisample.width !== width || this.#Multisample.height !== height)
        {
            this.#Multisample?.destroy();

            this.#Multisample = this.CreateTexture(
            {
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                label: label ?? "Multisample Texture",
                size: [width, height],
                sampleCount,
                format
            });
        }

        return this.#Multisample;
    }

    /**
     * @typedef {OptionalGPUExtent3DStrict & {
     *     create?: TextureDescriptor | boolean;
     *     colorSpace?: PredefinedColorSpace;
     *     sourceOrigin?: GPUOrigin2DStrict;
     *     destinationOrigin?: GPUOrigin3D;
     *     mipLevel?: GPUIntegerCoordinate;
     *     premultipliedAlpha?: boolean;
     *     aspect?: GPUTextureAspect;
     *     texture?: GPUTexture;
     *     mipmaps?: boolean;
     *     flipY?: boolean;
     * }} CopyOptions
     *
     * @param {GPUImageCopyExternalImageSource} source
     * @param {CopyOptions} [options = { create: true }]
     */
    CopyImageToTexture(source, options = { create: true })
    {
        let { create, texture } = options;
        const [width, height] = this.#GetSourceSize(source);
        const { flipY, mipLevel, aspect, colorSpace, premultipliedAlpha, mipmaps } = options;

        // When `mipmaps` option is explicitly set to `false`, `mipmaps` option in the `create` configuration
        // object should also default to `false` to avoid creating mipmaps in the `CreateTextureFromSource` method.
        // One way to work around this, is to explicitly set `mipLevelCount` in the `create` configuration object so
        // that `CreateTextureFromSource` will ignore the `mipmaps` option and will only acount for `mipLevelCount`.
        if (mipmaps === false) (create = typeof create === "object" && create || {}).mipmaps ??= false;

        !texture && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyImageToTexture`.");
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions({ width, height, ...options }, "CopyImageToTexture")
        );

        if ((mipmaps ?? true) && 1 < texture.mipLevelCount)
            texture.depthOrArrayLayers === 1 ? this.GenerateMipmaps(texture) : this.GenerateCubeMipmaps(texture);

        return texture;
    }

    /**
     * @param {OptionalGPUExtent3DStrict & {
     *     source?: GPUImageCopyExternalImageSource;
     *     create?: TextureDescriptor | boolean;
     *     srcMipLevel?: GPUIntegerCoordinate;
     *     dstMipLevel?: GPUIntegerCoordinate;
     *     srcAspect?: GPUTextureAspect;
     *     dstAspect?: GPUTextureAspect;
     *     srcOrigin?: GPUOrigin3D;
     *     dstOrigin?: GPUOrigin3D;
     *     srcTexture?: GPUTexture;
     *     dstTexture?: GPUTexture;
     * }} options
     */
    CopyTextureToTexture(options)
    {
        const { source, create } = options;
        let { srcTexture, dstTexture } = options;

        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "copying a texture to a texture.");
        !srcTexture && !source && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyTextureToTexture`.");

        srcTexture ??= this.CreateTextureFromSource(source, create);
        dstTexture ??= this.CreateTextureFromSource(srcTexture, create);

        const { srcMipLevel, srcOrigin, srcAspect } = options;
        const { dstMipLevel, dstOrigin, dstAspect } = options;
        const [width, height] = this.#GetSourceSize(srcTexture);

        this.#Renderer.GetCommandEncoder(true).copyTextureToTexture(
            { texture: srcTexture, mipLevel: srcMipLevel, origin: srcOrigin, aspect: srcAspect },
            { texture: dstTexture, mipLevel: dstMipLevel, origin: dstOrigin, aspect: dstAspect },
            this.#GetSizeOptions({ width, height, ...options }, "CopyTextureToTexture")
        );
    }

    /**
     * @param {GPUImageCopyBuffer & Partial<GPUImageCopyTexture> & OptionalGPUExtent3DStrict & {
     *     source?: GPUImageCopyExternalImageSource;
     *     create?: TextureDescriptor | boolean;
     * }} options
     */
    CopyTextureToBuffer(options)
    {
        const { source, create } = options;
        let { texture, bytesPerRow } = options;

        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "copying a texture to a buffer.");
        !texture && !source && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyTextureToBuffer`.");

        texture ??= this.CreateTextureFromSource(source, create);
        const [width, height] = this.#GetSourceSize(texture);

        const { buffer, offset, rowsPerImage, mipLevel, origin, aspect } = options;
        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;
        this.#ValidateBytesPerRow(bytesPerRow, "CopyTextureToBuffer");

        this.#Renderer.GetCommandEncoder(true).copyTextureToBuffer(
            { texture, mipLevel, origin, aspect },
            { buffer, offset, bytesPerRow, rowsPerImage },
            this.#GetSizeOptions({ width, height, ...options }, "CopyTextureToBuffer")
        );
    }

    /**
     * @param {GPUImageCopyBuffer & Partial<GPUImageCopyTexture> & OptionalGPUExtent3DStrict & {
     *     source?: GPUImageCopyExternalImageSource;
     *     create?: TextureDescriptor | boolean;
     * }} options
     */
    CopyBufferToTexture(options)
    {
        const { source, create } = options;
        let { texture, bytesPerRow } = options;

        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "copying a buffer to a texture.");
        !texture && !source && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyBufferToTexture`.");

        texture ??= this.CreateTextureFromSource(source, create);
        const [width, height] = this.#GetSourceSize(texture);

        const { buffer, offset, rowsPerImage, mipLevel, origin, aspect } = options;
        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;
        this.#ValidateBytesPerRow(bytesPerRow, "CopyBufferToTexture");

        this.#Renderer.GetCommandEncoder(true).copyBufferToTexture(
            { buffer, offset, bytesPerRow, rowsPerImage },
            { texture, mipLevel, origin, aspect },
            this.#GetSizeOptions({ width, height, ...options }, "CopyBufferToTexture")
        );
    }

    /** @returns {GPUTextureFormat} */
    get PreferredStorageFormat()
    {
        const preferredFormat = Device.PreferredCanvasFormat;

        return this.#Device.features.has("bgra8unorm-storage") &&
            preferredFormat === "bgra8unorm" ? preferredFormat : "rgba8unorm";
    }

    /** @param {GPUTexture} texture */
    GenerateCubeMipmaps(texture)
    {
        this.#CreateMipmaps(texture, { minMagFilter: FILTER.LINEAR }, baseMipLevel =>
        {
            for (let l = 0; l < texture.depthOrArrayLayers; ++l)
            {
                this.#Renderer.SetBindGroups(
                    this.#Renderer.CreateBindGroup(
                        this.#Renderer.CreateBindGroupEntries([
                            this.#MipmapsSampler, texture.createView({
                                baseMipLevel: baseMipLevel - 1,
                                arrayLayerCount: 1,
                                baseArrayLayer: l,
                                mipLevelCount: 1,
                                dimension: "2d"
                            })
                        ])
                    )
                );

                this.#Renderer.CreatePassDescriptor(
                    this.#Renderer.CreateColorAttachment(
                        texture.createView({
                            arrayLayerCount: 1,
                            baseArrayLayer: l,
                            mipLevelCount: 1,
                            dimension: "2d",
                            baseMipLevel
                        })
                    )
                );

                this.#Renderer.Render(6, false);
                this.#Renderer.DestroyCurrentPass();
            }
        });
    }

    /** @param {GPUTexture} texture */
    GenerateMipmaps(texture)
    {
        this.#CreateMipmaps(texture, { minFilter: FILTER.LINEAR }, baseMipLevel =>
        {
            this.#Renderer.SetBindGroups(
                this.#Renderer.CreateBindGroup(
                    this.#Renderer.CreateBindGroupEntries([
                        this.#MipmapsSampler, texture.createView({
                            baseMipLevel: baseMipLevel - 1, mipLevelCount: 1
                        })
                    ])
                )
            );

            this.#Renderer.CreatePassDescriptor(
                this.#Renderer.CreateColorAttachment(
                    texture.createView({ baseMipLevel, mipLevelCount: 1 })
                )
            );

            this.#Renderer.Render(6, false);
            this.#Renderer.DestroyCurrentPass();
        });
    }

    /** @param {GPUImageCopyExternalImageSource | GPUTexture} source */
    GetMipmapLevels(source)
    {
        const [width, height] = this.#GetSourceSize(source);
        return (Math.log2(Math.max(width, height)) | 0) + 1;
    }

    /** @param {LegacyRenderer} renderer */
    set LegacyRenderer(renderer)
    {
        this.#Renderer = renderer;
    }

    /**
     * @deprecated Pass `LegacyRenderer` instance to the `Texture` constructor or use `Texture.LegacyRenderer` setter instead.
     * @param {LegacyRenderer} renderer
     */
    SetRenderer(renderer)
    {
        this.LegacyRenderer = renderer;
    }

    Destroy()
    {
        this.#Multisample = this.#Multisample?.destroy();
    }
}
