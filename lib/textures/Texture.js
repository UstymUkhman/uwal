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
     * @typedef {OptionalGPUExtent3DStrict & {
     *     colorSpace?: PredefinedColorSpace;
     *     sourceOrigin?: GPUOrigin2DStrict;
     *     destinationOrigin?: GPUOrigin3D;
     *     mipLevel?: GPUIntegerCoordinate;
     *     premultipliedAlpha?: boolean;
     *     aspect?: GPUTextureAspect;
     *     texture: GPUTexture;
     *     flipY?: boolean;
     * }} CopyOptions
     *
     * @param {GPUImageCopyExternalImageSource} source
     * @param {CopyOptions} options
     */
    CopyImageToTexture(source, options)
    {
        const { texture, mipLevel, aspect, colorSpace, premultipliedAlpha } = options;

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY: options.flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions(options)
        );
    }

    /** @param {GPUSamplerDescriptor} [descriptor] */
    CreateSampler(descriptor)
    {
        return this.#Device.createSampler(descriptor);
    }
}
