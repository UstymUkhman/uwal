import { ERROR, ThrowError } from "@/Errors";
import { FILTER } from "./Constants";
import { Mipmaps } from "@/shaders";

export default class Texture
{
    /** @type {GPUDevice} */ #Device;
    /** @type {string} */ #TextureName;

    /** @type {GPUSampler | undefined} */ #MipmapsSampler;
    /** @type {GPUShaderModule | undefined} */ #MipmapsModule;
    /** @type {import("../pipelines").RenderPipeline | undefined} */ #Renderer;

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
     * @param {string} caller
     */
    #GetSizeOptions(options, caller)
    {
        const { size, width, height, depthOrArrayLayers } = options;
        !size && !width && ThrowError(ERROR.TEXTURE_SIZE_NOT_FOUND, `\`${caller}\` method.`);

        return size ?? { width, height, depthOrArrayLayers };
    }

    /** @param {GPUImageCopyExternalImageSource} source */
    #GetSourceSize(source)
    {
        return source instanceof VideoFrame ? [source.codedWidth, source.codedHeight] : [source.width, source.height];
    }

    /** @param {GPUTexture} texture */
    GenerateMipmaps(texture)
    {
        !this.#Renderer && ThrowError(ERROR.RENDER_PIPELNE_NOT_FOUND);

        if (!this.#MipmapsModule || !this.#MipmapsSampler)
        {
            this.#MipmapsModule = this.#Renderer.CreateShaderModule(Mipmaps);
            this.#MipmapsSampler = this.CreateSampler({ minFilter: FILTER.LINEAR });
        }

        let baseMipLevel = 0;
        let width = texture.width;
        let height = texture.height;

        // Save previous render pipeline state:
        const bindGroups = this.#Renderer.CopyBindGroups();
        const useCurrentTextureView = this.#Renderer.UseCurrentTextureView;
        const renderPipeline = /** @type {GPURenderPipeline} */ (this.#Renderer.GetPipeline());
        const passDescriptor = /** @type {GPURenderPassDescriptor} */ (this.#Renderer.GetDescriptor());

        this.#Renderer.CreatePipeline({
            fragment: this.#Renderer.CreateFragmentState(this.#MipmapsModule, "fragment", { format: texture.format }),
            vertex: this.#Renderer.CreateVertexState(this.#MipmapsModule)
        });

        while (1 < width || 1 < height)
        {
            width = Math.max(width * 0.5 | 0, 1);
            height = Math.max(height * 0.5 | 0, 1);

            this.#Renderer.SetBindGroups(
                this.#Renderer.CreateBindGroup(
                    this.#Renderer.CreateBindGroupEntries([
                        this.#MipmapsSampler,
                        texture.createView({
                            baseMipLevel: baseMipLevel++,
                            mipLevelCount: 1
                        })
                    ])
                )
            );

            this.#Renderer.CreatePassDescriptor(this.#Renderer.CreateColorAttachment(
                texture.createView({ baseMipLevel, mipLevelCount: 1 })
            ));

            this.#Renderer.Render(6);
        }

        // Restore previous render pipeline state:
        this.#Renderer.SetPipeline(renderPipeline);
        this.#Renderer.RestoreBindGroups(bindGroups);
        this.#Renderer.SetPassDescriptor(passDescriptor);
        this.#Renderer.UseCurrentTextureView = useCurrentTextureView;
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

        !texture && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND);
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions({ width, height, ...options }, "CopyImageToTexture")
        );

        1 < texture.mipLevelCount && this.GenerateMipmaps(texture);

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

    /** @param {import("../pipelines").RenderPipeline} renderer */
    SetRenderer(renderer)
    {
        this.#Renderer = renderer;
    }
}
