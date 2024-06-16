import { ERROR, ThrowError } from "@/Errors";

export default class Texture
{
    /** @type {GPUDevice} */ #Device;
    /** @type {string} */ #TextureName;

    /**
     * @param {GPUDevice} [device = undefined]
     * @param {string} [textureName = ""]
     */
    constructor(device, textureName)
    {
        !device && ThrowError(ERROR.DEVICE_NOT_REQUESTED);
        this.#TextureName = textureName;
        this.#Device = device;
    }

    /** @param {string} [label = ""] */
    #CreateTextureLabel(label)
    {
        return this.#TextureName && label && `${this.#TextureName} ${label}` || "";
    }

    /**
     * @typedef {Partial<GPUExtent3DDict> & { size?: Iterable<GPUIntegerCoordinate> }} OptionalGPUExtent3DStrict
     * @param {OptionalGPUExtent3DStrict} options
     */
    #GetSizeOptions(options)
    {
        const { size, width, height, depthOrArrayLayers } = options;
        !size && !width && ThrowError(ERROR.TEXTURE_SIZE_NOT_FOUND);

        return size ?? { width, height, depthOrArrayLayers };
    }

    /** @param {GPUImageCopyExternalImageSource} source */
    #GetSourceSize(source)
    {
        return source instanceof VideoFrame ? [source.codedWidth, source.codedHeight] : [source.width, source.height];
    }

    /** @param {GPUTextureDescriptor} descriptor */
    CreateTexture(descriptor)
    {
        const label = descriptor.label ?? this.#CreateTextureLabel("Texture");
        return this.#Device.createTexture({ ...descriptor, label });
    }

    /**
     * @typedef {GPUImageCopyTexture & GPUImageDataLayout & OptionalGPUExtent3DStrict} WriteOptions
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {WriteOptions} options
     */
    WriteTexture(data, options)
    {
        const { texture, mipLevel, origin, aspect, offset, bytesPerRow, rowsPerImage } = options;

        this.#Device.queue.writeTexture(
            { texture, mipLevel, origin, aspect },
            data,
            { offset, bytesPerRow, rowsPerImage },
            this.#GetSizeOptions(options)
        );
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
     * @typedef {
           Pick<Partial<GPUTextureDescriptor>, "size"> &
           Omit<GPUTextureDescriptor, "size"> &
           { mipmaps?: boolean }
       } TextureDescriptor
     *
     * @param {GPUImageCopyExternalImageSource} source
     * @param {TextureDescriptor} options
     */
    CreateTextureFromSource(source, options)
    {
        const mipLevelCount = options.mipLevelCount ?? ((options.mipmaps && this.GetMipmapLevels(source)) || void 0);
        const sizeArray = /** @type {Iterable<GPUIntegerCoordinate>} */ (options.size);
        const sizeObject = /** @type {GPUExtent3DDict} */ (options.size);

        const size = Array.isArray(options.size) || !options.size
            ? sizeArray ?? this.#GetSourceSize(source)
            : [sizeObject.width, sizeObject.height];

        return this.CreateTexture({ mipLevelCount, size, ...options });
    }

    /**
     * @typedef {OptionalGPUExtent3DStrict & {
     *     colorSpace?: PredefinedColorSpace;
     *     sourceOrigin?: GPUOrigin2DStrict;
     *     destinationOrigin?: GPUOrigin3D;
     *     mipLevel?: GPUIntegerCoordinate;
     *     premultipliedAlpha?: boolean;
     *     create?: TextureDescriptor;
     *     aspect?: GPUTextureAspect;
     *     texture?: GPUTexture;
     *     flipY?: boolean;
     * }} CopyOptions
     *
     * @param {GPUImageCopyExternalImageSource} source
     * @param {CopyOptions} options
     */
    CopyImageToTexture(source, options)
    {
        let { texture } = options;
        const [width, height] = this.#GetSourceSize(source);
        const { create, flipY, mipLevel, aspect, colorSpace, premultipliedAlpha } = options;

        !texture && !create && ThrowError(ERROR.TEXTURE_SIZE_NOT_FOUND);
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions({ width, height, ...options })
        );

        return texture;
    }

    /** @param {GPUSamplerDescriptor} [descriptor] */
    CreateSampler(descriptor)
    {
        return this.#Device.createSampler(descriptor);
    }

    /** @param {GPUImageCopyExternalImageSource} source */
    GetMipmapLevels(source)
    {
        const [width, height] = this.#GetSourceSize(source);
        return (Math.log2(Math.max(width, height)) | 0) + 1;
    }
}
