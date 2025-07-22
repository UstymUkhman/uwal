import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { USAGE, FILTER } from "./Constants";
import { Mipmaps } from "#/shaders";
import Device from "#/Device";

export default class Texture
{
    /** @type {GPUDevice} */ #Device;
    /** @type {GPUTexture} */ #Multisample;
    /** @type {Renderer | undefined} */ #Renderer;
    /** @type {GPUSampler | undefined} */ #MipmapsSampler;
    /** @type {GPUShaderModule | undefined} */ #MipmapsModule;

    /**
     * @param {GPUDevice} [device]
     * @param {Renderer} [renderer]
     */
    constructor(device, renderer)
    {
        !device && ThrowError(ERROR.DEVICE_NOT_REQUESTED);
        this.#Renderer = renderer;
        this.#Device = device;
    }

    /** @param {GPUCopyExternalImageSource | GPUTexture} source */
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
     * @typedef {import("./Constants").Address} Address
     * @typedef {import("./Constants").Filter} Filter
     *
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
        const { format = Device.PreferredCanvasFormat, usage = USAGE.RENDER } = descriptor;
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
     * @param {GPUCopyExternalImageSource | GPUTexture} source
     * @param {TextureDescriptor | boolean} [options = {
           format: Device.PreferredCanvasFormat,
           usage: USAGE.RENDER,
           mipmaps: true
       }]
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
     * @param {string} source
     * @param {Record<string, unknown>} [attributes = {}]
     * @returns {Promise<GPUCopyExternalImageSource>}
     */
    async LoadExternalImageSource(source, attributes = {})
    {
        return new Promise(resolve =>
        {
            const image = new Image();

            for (const attribute in attributes)
                image[attribute] = attributes[attribute];

            image.onload = () => resolve(image);
            image.src = source;
        });
    }

    /**
     * @param {boolean} [force = false]
     * @param {number} [sampleCount = 4]
     * @param {string} [label = "Multisample Texture"]
     */
    CreateMultisampleTexture(force = false, sampleCount = 4, label)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a multisample texture.");
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
     * @param {GPUCopyExternalImageSource} source
     * @param {CopyOptions} [options = { create: true }]
     */
    async CopyImageToTexture(source, options = { create: true })
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
            texture.depthOrArrayLayers === 1
                ? await this.GenerateMipmaps(texture)
                : await this.GenerateCubeMipmaps(texture);

        return texture;
    }

    /**
     * @param {GPUTexture} texture
     * @param {SamplerDescriptor} descriptor
     * @param {(baseMipLevel: number) => void} loop
     */
    async #CreateMipmaps(texture, descriptor, loop)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a texture with mipmaps.");

        const MipmapsPipeline = new this.#Renderer.Pipeline();
        MipmapsPipeline.DestroyPassEncoder = true;
        MipmapsPipeline.SetDrawParams(6);

        if (!this.#MipmapsModule || !this.#MipmapsSampler)
        {
            this.#MipmapsModule = MipmapsPipeline.CreateShaderModule(Mipmaps);
            this.#MipmapsSampler = this.CreateSampler(descriptor);
        }

        await this.#Renderer.AddPipeline(MipmapsPipeline,
        {
            vertex: MipmapsPipeline.CreateVertexState(this.#MipmapsModule),
            fragment: MipmapsPipeline.CreateFragmentState(this.#MipmapsModule, void 0,
                MipmapsPipeline.CreateColorTargetState(texture.format)
            )
        });

        for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel)
            loop(MipmapsPipeline, baseMipLevel);

        this.#Renderer.SubmitCommandBuffer();
        this.#Renderer.CommandEncoder = undefined;
        this.#Renderer.RemovePipeline(MipmapsPipeline);
        this.#MipmapsModule = this.#MipmapsSampler = void 0;
    }

    /** @param {GPUTexture} texture */
    async GenerateCubeMipmaps(texture)
    {
        return this.#CreateMipmaps(texture, { minMagFilter: FILTER.LINEAR }, (Pipeline, baseMipLevel) =>
        {
            for (let l = 0; l < texture.depthOrArrayLayers; ++l)
            {
                Pipeline.SetBindGroups(
                    Pipeline.CreateBindGroup(
                        Pipeline.CreateBindGroupEntries([
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
                        undefined, texture.createView({
                            arrayLayerCount: 1,
                            baseArrayLayer: l,
                            mipLevelCount: 1,
                            dimension: "2d",
                            baseMipLevel
                        })
                    )
                );

                this.#Renderer.Render(false);
            }
        });
    }

    /** @param {GPUTexture} texture */
    async GenerateMipmaps(texture)
    {
        return this.#CreateMipmaps(texture, { minFilter: FILTER.LINEAR }, (Pipeline, baseMipLevel) =>
        {
            Pipeline.SetBindGroups(
                Pipeline.CreateBindGroup(
                    Pipeline.CreateBindGroupEntries([
                        this.#MipmapsSampler, texture.createView({
                            baseMipLevel: baseMipLevel - 1, mipLevelCount: 1
                        })
                    ])
                )
            );

            this.#Renderer.CreatePassDescriptor(
                this.#Renderer.CreateColorAttachment(
                    undefined, texture.createView({ baseMipLevel, mipLevelCount: 1 })
                )
            );

            this.#Renderer.Render(false);
        });
    }

    /**
     * @param {OptionalGPUExtent3DStrict & {
     *     create?: TextureDescriptor | boolean;
     *     source?: GPUCopyExternalImageSource;
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

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a texture to a texture.");
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
     *     create?: TextureDescriptor | boolean;
     *     source?: GPUCopyExternalImageSource;
     * }} options
     */
    CopyTextureToBuffer(options)
    {
        const { source, create } = options;
        let { texture, bytesPerRow } = options;

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a texture to a buffer.");
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
     *     create?: TextureDescriptor | boolean;
     *     source?: GPUCopyExternalImageSource;
     * }} options
     */
    CopyBufferToTexture(options)
    {
        const { source, create } = options;
        let { texture, bytesPerRow } = options;

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a buffer to a texture.");
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

    /** @param {GPUCopyExternalImageSource | GPUTexture} source */
    GetMipmapLevels(source)
    {
        const [width, height] = this.#GetSourceSize(source);
        return (Math.log2(Math.max(width, height)) | 0) + 1;
    }

    /** @param {Renderer} renderer */
    set Renderer(renderer)
    {
        this.#Renderer = renderer;
    }

    Destroy()
    {
        this.#Multisample = this.#Multisample?.destroy();
    }
}
