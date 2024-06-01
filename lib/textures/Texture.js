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

    /** @param {GPUTextureDescriptor} descriptor */
    CreateTexture(descriptor)
    {
        const label = descriptor.label ?? this.#CreateTextureLabel("Texture");
        return this.#Device.createTexture({ ...descriptor, label });
    }

    /**
     * @typedef {GPUImageCopyTexture & GPUImageDataLayout & {
     *     depthOrArrayLayers?: GPUIntegerCoordinate;
     *     size?: Iterable<GPUIntegerCoordinate>;
     *     height?: GPUIntegerCoordinate;
     *     width?: GPUIntegerCoordinate;
     * }} WriteOptions
     *
     * @param {BufferSource | SharedArrayBuffer} data
     * @param {WriteOptions} options
     */
    WriteTexture(data, options)
    {
        !options.size && !options.width && ThrowError(ERROR.TEXTURE_SIZE_NOT_FOUND);

        const { texture, mipLevel, origin, aspect       } = options;
        const { offset, bytesPerRow, rowsPerImage       } = options;
        const { size, width, height, depthOrArrayLayers } = options;

        this.#Device.queue.writeTexture(
            { texture, mipLevel, origin, aspect },
            data,
            { offset, bytesPerRow, rowsPerImage },
            size ?? { width, height, depthOrArrayLayers }
        );
    }

    /** @param {GPUSamplerDescriptor} [descriptor] */
    CreateSampler(descriptor)
    {
        return this.#Device.createSampler(descriptor);
    }
}
