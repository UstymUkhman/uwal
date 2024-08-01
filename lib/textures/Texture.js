import { ADDRESS, FILTER } from "./Constants";
import { ERROR, ThrowError } from "@/Errors";
import { Mipmaps } from "@/shaders";

export default class Texture
{
    /** @type {GPUDevice} */ #Device;
    /** @type {string} */ #TextureName;
    /** @type {GPUTexture} */ #Multisample;

    /** @type {GPUSampler | undefined} */ #MipmapsSampler;
    /** @type {GPUShaderModule | undefined} */ #MipmapsModule;
    /** @type {import("../pipelines").RenderPipeline | undefined} */ #Renderer;

    /**
     * @param {GPUDevice} [device]
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
     * @param {GPUTexture} texture
     * @param {SamplerDescriptor} descriptor
     * @param {(baseMipLevel: number) => void} loop
     */
    #CreateMipmaps(texture, descriptor, loop)
    {
        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "texture with mipmaps.");

        if (!this.#MipmapsModule || !this.#MipmapsSampler)
        {
            this.#MipmapsModule = this.#Renderer.CreateShaderModule(Mipmaps);
            this.#MipmapsSampler = this.CreateSampler(descriptor);
        }

        let baseMipLevel = 0;
        let width = texture.width;
        let height = texture.height;

        this.#Renderer.SavePipelineState();
        this.#Renderer.ResetPipelineState();

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
            this.#GetSizeOptions(options, "WriteTexture")
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
     * @param {GPUImageCopyExternalImageSource | GPUTexture} source
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
        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND, "multisample texture.");
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
     *     colorSpace?: PredefinedColorSpace;
     *     sourceOrigin?: GPUOrigin2DStrict;
     *     destinationOrigin?: GPUOrigin3D;
     *     mipLevel?: GPUIntegerCoordinate;
     *     premultipliedAlpha?: boolean;
     *     create?: TextureDescriptor;
     *     aspect?: GPUTextureAspect;
     *     generateMipmaps?: boolean;
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
        const { create, flipY, mipLevel, aspect, colorSpace, premultipliedAlpha, generateMipmaps = true } = options;

        !texture && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND);
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions({ width, height, ...options }, "CopyImageToTexture")
        );

        if (generateMipmaps && 1 < texture.mipLevelCount)
            texture.depthOrArrayLayers === 1
                ? this.GenerateMipmaps(texture)
                : this.GenerateCubeMipmaps(texture);

        return texture;
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

    /** @param {import("../pipelines").RenderPipeline} renderer */
    set Renderer(renderer)
    {
        this.#Renderer = renderer;
    }

    /**
     * @deprecated Use Texture.Renderer setter instead.
     * @param {import("../pipelines").RenderPipeline} renderer
     */
    SetRenderer(renderer)
    {
        this.Renderer = renderer;
    }
}
