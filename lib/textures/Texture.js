import { ERROR, ThrowError, ThrowWarning } from "@/Errors";
import { USAGE, ADDRESS, FILTER } from "./Constants";
import { Mipmaps } from "@/shaders";

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
        this.Renderer = renderer;
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

        let baseMipLevel = 0;
        let width = texture.width;
        let height = texture.height;

        this.#Renderer.CreatePipeline(
        {
            vertex: this.#Renderer.CreateVertexState(this.#MipmapsModule),
            fragment: this.#Renderer.CreateFragmentState(
                this.#MipmapsModule,
                void 0,
                this.#Renderer.CreateTargetState(texture.format)
            )
        });

        while (1 < width || 1 < height)
        {
            width = Math.max(width * 0.5 | 0, 1);
            height = Math.max(height * 0.5 | 0, 1);

            loop(baseMipLevel++);
        }

        this.#Renderer.SubmitCommandBuffer();
        this.#Renderer.SetCommandEncoder(void 0);
        this.#Renderer.RestorePipelineState();

        this.#MipmapsModule = this.#MipmapsSampler = void 0;
    }

    /** @param {GPUTextureDescriptor} descriptor */
    CreateTexture(descriptor)
    {
        const label = descriptor.label ?? "Texture";
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
        const [width, height] = this.#GetSourceSize(texture);

        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;

        this.#Device.queue.writeTexture(
            { texture, mipLevel, origin, aspect },
            data,
            { offset, bytesPerRow, rowsPerImage },
            this.#GetSizeOptions({ width, height, ...options }, "WriteTexture")
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
     * @typedef {Partial<GPUTextureDescriptor> & { mipmaps?: boolean }} TextureDescriptor
     * @param {GPUImageCopyExternalImageSource | GPUTexture} source
     * @param {TextureDescriptor | boolean} [options = { mipmaps: true, format: "rgba8unorm", usage: USAGE.RENDER }]
     */
    CreateTextureFromSource(source, options = {})
    {
        options = /** @type {TextureDescriptor} */ (typeof options === "boolean" && {} || options);
        const { mipmaps = true, size: dimensions, format = "rgba8unorm", usage = USAGE.RENDER } = options;
        const mipLevelCount = options.mipLevelCount ?? ((mipmaps && this.GetMipmapLevels(source)) || void 0);

        const sizeArray = /** @type {Iterable<GPUIntegerCoordinate>} */ (dimensions);
        const sizeObject = /** @type {GPUExtent3DDict} */ (dimensions);

        const size = Array.isArray(dimensions) || !dimensions
            ? sizeArray ?? this.#GetSourceSize(source)
            : [sizeObject.width, sizeObject.height];

        return this.CreateTexture({ size, mipLevelCount, format, usage, ...options });
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
     *     generateMipmaps?: boolean;
     *     texture?: GPUTexture;
     *     flipY?: boolean;
     * }} CopyOptions
     *
     * @param {GPUImageCopyExternalImageSource} source
     * @param {CopyOptions} [options = { create: true }]
     */
    CopyImageToTexture(source, options = { create: true })
    {
        let { texture } = options;
        const [width, height] = this.#GetSourceSize(source);
        const { create, flipY, mipLevel, aspect, colorSpace, premultipliedAlpha, generateMipmaps } = options;

        !texture && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyImageToTexture`.");
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions({ width, height, ...options }, "CopyImageToTexture")
        );

        if ((generateMipmaps ?? true) && 1 < texture.mipLevelCount)
            texture.depthOrArrayLayers === 1 ? this.GenerateMipmaps(texture) : this.GenerateCubeMipmaps(texture);

        return texture;
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

        const [width, height] = this.#GetSourceSize(texture ?? source);
        const { buffer, offset, rowsPerImage, mipLevel, origin, aspect } = options;

        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;
        this.#ValidateBytesPerRow(bytesPerRow, "CopyBufferToTexture");
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Renderer.GetCommandEncoder(true).copyBufferToTexture(
            { buffer, offset, bytesPerRow, rowsPerImage },
            { texture, mipLevel, origin, aspect },
            this.#GetSizeOptions({ width, height, ...options }, "CopyBufferToTexture")
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

        const [width, height] = this.#GetSourceSize(texture ?? source);
        const { buffer, offset, rowsPerImage, mipLevel, origin, aspect } = options;

        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;
        this.#ValidateBytesPerRow(bytesPerRow, "CopyTextureToBuffer");
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Renderer.GetCommandEncoder(true).copyTextureToBuffer(
            { texture, mipLevel, origin, aspect },
            { buffer, offset, bytesPerRow, rowsPerImage },
            this.#GetSizeOptions({ width, height, ...options }, "CopyTextureToBuffer")
        );
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
                                arrayLayerCount: 1,
                                baseArrayLayer: l,
                                mipLevelCount: 1,
                                dimension: "2d",
                                baseMipLevel
                            })
                        ])
                    )
                );

                this.#Renderer.CreatePassDescriptor(
                    this.#Renderer.CreateColorAttachment(
                        texture.createView({
                            baseMipLevel: baseMipLevel + 1,
                            arrayLayerCount: 1,
                            baseArrayLayer: l,
                            mipLevelCount: 1,
                            dimension: "2d"
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
                            baseMipLevel: baseMipLevel++, mipLevelCount: 1
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

    /** @param {GPUImageCopyExternalImageSource | GPUTexture} source */
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

    /**
     * @deprecated Pass `Renderer` instance to the `Texture` constructor or use `Texture.Renderer` setter instead.
     * @param {Renderer} renderer
     */
    SetRenderer(renderer)
    {
        this.Renderer = renderer;
    }
}
