/** @module Texture */

import { Mipmaps } from "#/shaders";
import { USAGE, FILTER } from "./Constants";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

/**
 * @typedef {Partial<GPUExtent3DDict> & Partial<Record<"size", Iterable<GPUIntegerCoordinate>>>} OptionalGPUExtent3DStrict
 * @typedef {Partial<GPUTextureDescriptor> & Partial<Record<"mipmaps", boolean>>} TextureDescriptor
 * @typedef {import("./Constants").Address} Addresses
 * @typedef {import("./Constants").Filter} Filters
 *
 * @typedef {Object} SamplerDescriptor
 * @property {Addresses[keyof Addresses]} [addressModeUV]
 * @property {Addresses[keyof Addresses]} [addressMode]
 * @property {Filters[keyof Filters]} [minMagFilter]
 * @property {Filters[keyof Filters]} [filter]
 *
 * @typedef {Object} CopyImageOptions
 * @property {TextureDescriptor | boolean} [create]
 * @property {PredefinedColorSpace} [colorSpace]
 * @property {GPUIntegerCoordinate} [mipLevel]
 * @property {GPUOrigin3D} [destinationOrigin]
 * @property {boolean} [premultipliedAlpha]
 * @property {GPUOrigin2D} [sourceOrigin]
 * @property {GPUTextureAspect} [aspect]
 * @property {GPUTexture} [texture]
 * @property {boolean} [mipmaps]
 * @property {boolean} [flipY]
 *
 * @typedef {Object} CopyBufferOptions
 * @property {TextureDescriptor | boolean} [create]
 * @property {GPUCopyExternalImageSource} [source]
 *
 * @typedef {Object} CopyTextureOptions
 * @property {GPUIntegerCoordinate} [srcMipLevel]
 * @property {GPUIntegerCoordinate} [dstMipLevel]
 * @property {GPUTextureAspect} [srcAspect]
 * @property {GPUTextureAspect} [dstAspect]
 * @property {GPUOrigin3D} [srcOrigin]
 * @property {GPUOrigin3D} [dstOrigin]
 * @property {GPUTexture} [srcTexture]
 * @property {GPUTexture} [dstTexture]
 */

/**
 * @hideconstructor
 * Utility class to manage textures and samplers.
 */
export class Texture
{
    /** @type {GPUDevice} */ #Device;
    /** @type {Renderer | undefined} */ #Renderer;
    /** @type {GPUTexture | undefined} */ #Multisample;
    /** @type {GPUSampler | undefined} */ #MipmapsSampler;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;
    /** @type {GPUShaderModule | undefined} */ #MipmapsModule;

    /**
     * @param {GPUDevice} device
     * @param {GPUTextureFormat} format
     * @param {Renderer} [renderer]
     */
    constructor(device, format, renderer)
    {
        this.#Device = /** @type {GPUDevice} */ (device);
        this.#PreferredCanvasFormat = format;
        this.#Renderer = renderer;
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
     * Calculate the number of mipmaps required for the `source` based on its dimensions.
     * @param {GPUCopyExternalImageSource | GPUTexture} source - `GPUTexture` or an image source to create mipmaps for
     */
    #GetMipmapLevels(source)
    {
        const [width, height] = this.#GetSourceSize(source);
        return (Math.log2(Math.max(width, height)) | 0) + 1;
    }

    /**
     * @param {OptionalGPUExtent3DStrict} options
     * @param {string} caller
     */
    #GetSizeOptions(options, caller)
    {
        const { size, width, height, depthOrArrayLayers } = options;
        !size && !width && ThrowError(ERROR.TEXTURE_SIZE_NOT_FOUND, `\`${caller}\` method.`);
        return size ?? /** @type {GPUExtent3DDictStrict} */ ({ width, height, depthOrArrayLayers });
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
     * Create a new sampler from the `descriptor` object.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpudevice-createsampler}
     *
     * @param {GPUSamplerDescriptor & SamplerDescriptor} [descriptor] - `SamplerDescriptor.addressModeUV` is for width
     * and height; `SamplerDescriptor.addressMode` is for all 3 dimensions; `SamplerDescriptor.minMagFilter`
     * is for min and mag, and `SamplerDescriptor.filter` is for min, mag and `mipmapFilter`.
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
     * Create a new texture from the `descriptor` object.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture}
     *
     * @param {Pick<Partial<GPUTextureDescriptor>, "format" | "usage"> &
     *     Omit<GPUTextureDescriptor, "format" | "usage">
     * } descriptor - `format` and `usage` are optional and default to [Device.PreferredCanvasFormat](./Device#preferredcanvasformat)
     * and [USAGE.RENDER](./TEXTURE#usage-1), respectively
     */
    CreateTexture(descriptor)
    {
        const { textureBindingViewDimension: view = "2d" } = descriptor;
        const { label = "Texture", format = this.#PreferredCanvasFormat, usage = USAGE.RENDER } = descriptor;
        const dimension = /** @type {GPUTextureDimension} */ (["1d", "2d", "3d"].includes(view) && view || "2d");
        return this.#Device.createTexture({ label, format, usage, dimension, ...descriptor });
    }

    /**
     * Write `data` into a `GPUTexture`.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpuqueue-writetexture}
     *
     * @param {GPUAllowSharedBufferSource} data - Data to write
     * @param {GPUTexelCopyTextureInfo & GPUTexelCopyBufferLayout & OptionalGPUExtent3DStrict} options - A union of
     * `destination`, `dataLayout` and `size` arguments
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
     * Create a new storage texture.
     * @param {Pick<Partial<GPUTextureDescriptor>, "format" | "usage" | "size"> &
     *     Omit<GPUTextureDescriptor, "format" | "usage" | "size">
     * } descriptor - `format`, `usage` and `size` are optional and default to [PreferredStorageFormat](#preferredstorageformat),
     * [USAGE.STORAGE](./TEXTURE#usage-1), and canvas size, respectively
     */
    CreateStorageTexture(descriptor = {})
    {
        const label = descriptor.label ?? "Storage Texture";
        const usage = USAGE.STORAGE | (descriptor.usage || 0);
        let size = /** @type {GPUExtent3D} */ (descriptor.size);
        const { format = this.PreferredStorageFormat } = descriptor;

        size = this.#Renderer && !size ? this.#Renderer.CanvasSize : size;
        return this.CreateTexture({ label, size, format, ...descriptor, usage });
    }

    /**
     * Create a new texture using an existing `GPUTexture` or any valid external image sources.
     * @param {GPUTexture | GPUCopyExternalImageSource } source - `GPUTexture` or an image source reference
     * @param {TextureDescriptor | boolean} [descriptor = { mipmaps: true }] - Defaults to `{ mipmaps: true }`
     */
    CreateTextureFromSource(source, descriptor = {})
    {
        descriptor = /** @type {TextureDescriptor} */ (typeof descriptor === "boolean" && {} || descriptor);

        const sizeArray = /** @type {Iterable<GPUIntegerCoordinate>} */ (descriptor.size);
        const sizeObject = /** @type {GPUExtent3DDict} */ (descriptor.size);

        const mipLevelCount = descriptor.mipLevelCount ?? (
            ((descriptor.mipmaps ?? true) && this.#GetMipmapLevels(source)) || void 0
        );

        const size = /** @type {GPUExtent3D} */ (Array.isArray(descriptor.size) || !descriptor.size
            ? sizeArray ?? this.#GetSourceSize(source) : [sizeObject.width, sizeObject.height]);

        return this.CreateTexture({ size, mipLevelCount, ...descriptor });
    }

    /**
     * Create a new `GPUExternalTexture` from a video source.
     * @see [Video Color Grading](https://ustymukhman.github.io/uwal/dist/examples/examples.html#video-color-grading)
     * example for reference.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpudevice-importexternaltexture}
     *
     * @param {VideoFrame | HTMLVideoElement} source - Video source reference
     * @param {string} [label] - Descriptor label
     * @param {PredefinedColorSpace} [colorSpace] - Predefined color space
     */
    ImportExternalTexture(source, label, colorSpace)
    {
        return this.#Device.importExternalTexture({ source, label, colorSpace });
    }

    /**
     * Create a bitmap image from a valid source path.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap}
     *
     * @param {string} source - Image source path
     * @param {ImageBitmapOptions} [options = { colorSpaceConversion: "none" }] - Bitmap options
     * @param {RequestInit} [requestOptions] - `fetch` request options
     */
    async CreateImageBitmap(source, options, requestOptions)
    {
        const blob = await (await fetch(source, requestOptions)).blob();
        options ??= { colorSpaceConversion: "none" };
        return createImageBitmap(blob, options);
    }

    /**
     * Create a multisampled texture for the [Renderer.MultisampleTexture](./Renderer#multisampletexture).
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     *
     * @param {boolean} [force = false] - Force a new texture to be created
     * @param {number} [sampleCount = 4] - Must be either `1` or `4`
     * @param {string} [label = "Multisample Texture"] - Descriptor label
     */
    CreateMultisampleTexture(force = false, sampleCount = 4, label)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a multisample texture.");
        const { width, height, format } = /** @type {Renderer} */ (this.#Renderer).CurrentTexture;

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
     * Copy an image source into a texture and optionally generate mipmaps for it.
     * If `options.texture` is not provided, a new `GPUTexture` is created by default.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture}
     * @throws `ERROR.TEXTURE_NOT_FOUND` if called without `options.texture` and with
     * `options.create` being falsy when `options.mipmaps` is `true` or `undefined`.
     *
     * @param {GPUCopyExternalImageSource} source - Image source reference
     * @param {OptionalGPUExtent3DStrict & CopyImageOptions} [options = { create: true, flipY: true }] - Defaults to
     * `{ create: true, flipY: true }`
     */
    async CopyImageToTexture(source, options = { create: true, flipY: true })
    {
        let { create, texture, flipY = true } = options;
        const [width, height] = this.#GetSourceSize(source);
        const { mipLevel, aspect, colorSpace, premultipliedAlpha, mipmaps } = options;

        // When `mipmaps` option is explicitly set to `false`, `mipmaps` option in the `create` descriptor
        // object should also default to `false` to avoid creating mipmaps in the `CreateTextureFromSource` method.
        // One way to work around this, is to explicitly set `mipLevelCount` in the `create` descriptor object so
        // that `CreateTextureFromSource` will ignore the `mipmaps` option and will only acount for `mipLevelCount`.
        if (mipmaps === false) (create = typeof create === "object" && create || {}).mipmaps ??= false;

        !texture && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyImageToTexture`.");
        texture ??= this.CreateTextureFromSource(source, create);

        this.#Device.queue.copyExternalImageToTexture(
            { source, origin: options.sourceOrigin, flipY },
            { texture, mipLevel, origin: options.destinationOrigin, aspect, colorSpace, premultipliedAlpha },
            this.#GetSizeOptions({ width, height, ...options }, "CopyImageToTexture")
        );

        if ((mipmaps ?? true) && 1 < texture.mipLevelCount) await (
            texture.depthOrArrayLayers === 1 ? this.#GenerateMipmaps(texture) : this.#GenerateCubeMipmaps(texture)
        );

        return texture;
    }

    /**
     * Create a `"cube"` texture from `6` image sources. All images **must** have the same dimensions.
     * This method creates a bitmap image for each source and one cube texture and uses
     * that as the destination when copying bitmaps with `flipY` option set to `false`.
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     * @see [Environment maps](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#environment-maps)
     * and [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) lessons for reference.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gputextureviewdimension-cube}
     *
     * @param {string[]} sources - Array of `6` valid source paths
     * @param {ImageBitmapOptions} [bitmapOptions = { colorSpaceConversion: "none" }] - Bitmap options for [CreateImageBitmap](#createimagebitmap) method
     * @param {TextureDescriptor} [textureDescriptor = { mipmaps: true }] - Texture descriptor for [CreateTextureFromSource](#createtexturefromsource) method
     * @param {CopyImageOptions} [copyOptions = { flipY: false }] - Copy options for [CopyImageToTexture](#copyimagetotexture) method
     * @param {RequestInit} [requestOptions] - `fetch` request options for [CreateImageBitmap](#createimagebitmap) method
     */
    async CreateCubeTexture(sources, bitmapOptions, textureDescriptor, copyOptions, requestOptions)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a cube texture.");

        const bitmaps = await Promise.all(sources.map(source =>
            this.CreateImageBitmap(source, bitmapOptions, requestOptions)
        ));

        const texture = this.CreateTextureFromSource(bitmaps[0], {
            size: [bitmaps[0].width, bitmaps[0].height, bitmaps.length],
            textureBindingViewDimension: "cube",
            ...textureDescriptor
        });

        bitmaps.forEach((bitmap, b) => this.CopyImageToTexture(bitmap, {
            mipmaps: b === bitmaps.length - 1,
            destinationOrigin: [0, 0, b],
            flipY: false,
            texture,
            ...copyOptions
        }));

        return texture;
    }

    /**
     * @param {GPUTexture} texture
     * @param {GPUSamplerDescriptor & SamplerDescriptor} descriptor
     * @param {(Pipeline: RenderPipeline, baseMipLevel: number, viewDimension?: GPUTextureViewDimension) => void} loop
     * @param {GPUTextureViewDimension} [bindingViewDimension]
     */
    async #CreateMipmaps(texture, descriptor, loop, bindingViewDimension)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a texture with mipmaps.");

        const Renderer = /** @type {Renderer} */ (this.#Renderer);
        const { UseDepthStencilAttachment, RenderPassDescriptor } = Renderer;
        const { textureBindingViewDimension = bindingViewDimension } = texture;

        const pipelinesState = Renderer.Pipelines.map(Pipeline => {
            const state = Pipeline.Active;
            Pipeline.Active = false;
            return state;
        });

        const MipmapsPipeline = new Renderer.Pipeline();
        Renderer.UseDepthStencilAttachment = false;
        MipmapsPipeline.DestroyPassEncoder = true;
        MipmapsPipeline.UseTextureView = false;
        MipmapsPipeline.SetDrawParams(3, 1, 0);

        if (!this.#MipmapsModule || !this.#MipmapsSampler)
        {
            this.#MipmapsModule = MipmapsPipeline.CreateShaderModule(Mipmaps);
            this.#MipmapsSampler = this.CreateSampler(descriptor);
        }

        const entryPoint = textureBindingViewDimension?.includes("cube") && "fragmentCube"
            || textureBindingViewDimension === "2d-array" && "fragment2DArray" || "fragment2D";

        await Renderer.AddPipeline(MipmapsPipeline,
        {
            vertex: MipmapsPipeline.CreateVertexState(this.#MipmapsModule),
            fragment: MipmapsPipeline.CreateFragmentState(this.#MipmapsModule, entryPoint,
                MipmapsPipeline.CreateColorTargetState(void 0, void 0, texture.format)
            )
        });

        for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel)
            loop(MipmapsPipeline, baseMipLevel, textureBindingViewDimension);

        Renderer.SubmitCommandBuffer();
        Renderer.CommandEncoder = undefined;
        Renderer.RemovePipeline(MipmapsPipeline);

        this.#MipmapsModule = this.#MipmapsSampler = void 0;
        Renderer.UseDepthStencilAttachment = UseDepthStencilAttachment;
        pipelinesState.forEach((state, s) => Renderer.Pipelines[s].Active = state);

        const depthStencilAttachment = RenderPassDescriptor.depthStencilAttachment &&
            Renderer.CreateDepthStencilAttachment(
                RenderPassDescriptor.depthStencilAttachment.view,
                RenderPassDescriptor.depthStencilAttachment.depthClearValue,
                RenderPassDescriptor.depthStencilAttachment.depthLoadOp,
                RenderPassDescriptor.depthStencilAttachment.depthStoreOp,
                RenderPassDescriptor.depthStencilAttachment.depthReadOnly,
                Renderer.CreateStencilAttachment(
                    RenderPassDescriptor.depthStencilAttachment.stencilClearValue,
                    RenderPassDescriptor.depthStencilAttachment.stencilLoadOp,
                    RenderPassDescriptor.depthStencilAttachment.stencilStoreOp,
                    RenderPassDescriptor.depthStencilAttachment.stencilReadOnly
                )
            );

        Renderer.CreatePassDescriptor(
            /** @type {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} */
            (RenderPassDescriptor.colorAttachments),
            /** @type {GPURenderPassDepthStencilAttachment} */ (depthStencilAttachment),
            RenderPassDescriptor.label,
            RenderPassDescriptor.occlusionQuerySet,
            RenderPassDescriptor.timestampWrites,
            RenderPassDescriptor.maxDrawCount
        );
    }

    /** @param {GPUTexture} texture */
    async #GenerateCubeMipmaps(texture)
    {
        return this.#CreateMipmaps(texture, { minMagFilter: FILTER.LINEAR }, (Pipeline, baseMipLevel, viewDimension) =>
        {
            for (let l = 0; l < texture.depthOrArrayLayers; ++l)
            {
                Pipeline.SetBindGroupFromResources([
                    /** @type {GPUSampler} */ (this.#MipmapsSampler),
                    texture.createView({
                        baseMipLevel: baseMipLevel - 1,
                        dimension: viewDimension,
                        mipLevelCount: 1
                    })
                ]);

                /** @type {Renderer} */ (this.#Renderer).CreatePassDescriptor(
                    /** @type {GPURenderPassColorAttachment} */ (
                        /** @type {Renderer} */ (this.#Renderer).CreateColorAttachment(
                            void 0, texture.createView({
                                arrayLayerCount: 1,
                                baseArrayLayer: l,
                                mipLevelCount: 1,
                                dimension: "2d",
                                baseMipLevel
                            })
                        )
                    )
                );

                Pipeline.DrawParams[3] = l;
                /** @type {Renderer} */ (this.#Renderer).Render(false);
            }
        }, "2d-array");
    }

    /** @param {GPUTexture} texture */
    async #GenerateMipmaps(texture)
    {
        return this.#CreateMipmaps(texture, { minFilter: FILTER.LINEAR }, (Pipeline, baseMipLevel) =>
        {
            Pipeline.SetBindGroupFromResources([
                /** @type {GPUSampler} */ (this.#MipmapsSampler), texture.createView({
                    baseMipLevel: baseMipLevel - 1, mipLevelCount: 1
                })
            ]);

            /** @type {Renderer} */ (this.#Renderer).CreatePassDescriptor(
                /** @type {GPURenderPassColorAttachment} */ (
                    /** @type {Renderer} */ (this.#Renderer).CreateColorAttachment(
                        void 0, texture.createView({ baseMipLevel, mipLevelCount: 1 })
                    )
                )
            );

            /** @type {Renderer} */ (this.#Renderer).Render(false);
        });
    }

    /**
     * Copy `options.srcTexture` into `options.dstTexture`. If `options.dstTexture` is omitted, it defaults to
     * `options.srcTexture`. If `options.srcTexture` is omitted, it defaults first to `options.source` and then,
     * if it's not defined, this method creates a new texture using `options.create` descriptor.
     *
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetotexture}
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided and `ERROR.TEXTURE_NOT_FOUND`
     * if called without `options.srcTexture`, `options.source`, and with `options.create` being falsy.
     *
     * @param {OptionalGPUExtent3DStrict & CopyBufferOptions & CopyTextureOptions} options - Copy options
     */
    CopyTextureToTexture(options)
    {
        const { source, create } = options;
        let { srcTexture, dstTexture } = options;

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a texture to a texture.");
        !srcTexture && !source && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyTextureToTexture`.");

        srcTexture ??= this.CreateTextureFromSource(/** @type {GPUCopyExternalImageSource} */ (source), create);
        dstTexture ??= this.CreateTextureFromSource(srcTexture, create);

        const { srcMipLevel, srcOrigin, srcAspect } = options;
        const { dstMipLevel, dstOrigin, dstAspect } = options;
        const [width, height] = this.#GetSourceSize(srcTexture);

        /** @type {Renderer} */ (this.#Renderer).GetCommandEncoder(true).copyTextureToTexture(
            { texture: srcTexture, mipLevel: srcMipLevel, origin: srcOrigin, aspect: srcAspect },
            { texture: dstTexture, mipLevel: dstMipLevel, origin: dstOrigin, aspect: dstAspect },
            this.#GetSizeOptions({ width, height, ...options }, "CopyTextureToTexture")
        );
    }

    /**
     * Copy `options.texture` into `options.buffer`.
     * If `options.texture` is omitted, a new one is created using `options.source` reference.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer}
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided and `ERROR.TEXTURE_NOT_FOUND`
     * if called without `options.texture`, `options.source`, and with `options.create` being falsy.
     *
     * @param {GPUTexelCopyBufferInfo & Partial<GPUTexelCopyTextureInfo> & OptionalGPUExtent3DStrict & CopyBufferOptions} options - Copy options
     */
    CopyTextureToBuffer(options)
    {
        const { source, create } = options;
        let { texture, bytesPerRow } = options;

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a texture to a buffer.");
        !texture && !source && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyTextureToBuffer`.");

        texture ??= this.CreateTextureFromSource(/** @type {GPUCopyExternalImageSource} */ (source), create);
        const [width, height] = this.#GetSourceSize(texture);

        const { buffer, offset, rowsPerImage, mipLevel, origin, aspect } = options;
        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;
        this.#ValidateBytesPerRow(bytesPerRow, "CopyTextureToBuffer");

        /** @type {Renderer} */ (this.#Renderer).GetCommandEncoder(true).copyTextureToBuffer(
            { texture, mipLevel, origin, aspect },
            { buffer, offset, bytesPerRow, rowsPerImage },
            this.#GetSizeOptions({ width, height, ...options }, "CopyTextureToBuffer")
        );
    }

    /**
     * Copy `options.buffer` into `options.texture`.
     * If `options.texture` is omitted, a new one is created using `options.source` reference.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertotexture}
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided and `ERROR.TEXTURE_NOT_FOUND`
     * if called without `options.texture`, `options.source`, and with `options.create` being falsy.
     *
     * @param {GPUTexelCopyBufferInfo & Partial<GPUTexelCopyTextureInfo> & OptionalGPUExtent3DStrict & CopyBufferOptions} options - Copy options
     */
    CopyBufferToTexture(options)
    {
        const { source, create } = options;
        let { texture, bytesPerRow } = options;

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a buffer to a texture.");
        !texture && !source && !create && ThrowError(ERROR.TEXTURE_NOT_FOUND, "`CopyBufferToTexture`.");

        texture ??= this.CreateTextureFromSource(/** @type {GPUCopyExternalImageSource} */ (source), create);
        const [width, height] = this.#GetSourceSize(texture);

        const { buffer, offset, rowsPerImage, mipLevel, origin, aspect } = options;
        bytesPerRow ??= (options.width ?? width) * Float32Array.BYTES_PER_ELEMENT;
        this.#ValidateBytesPerRow(bytesPerRow, "CopyBufferToTexture");

        /** @type {Renderer} */ (this.#Renderer).GetCommandEncoder(true).copyBufferToTexture(
            { buffer, offset, bytesPerRow, rowsPerImage },
            { texture, mipLevel, origin, aspect },
            this.#GetSizeOptions({ width, height, ...options }, "CopyBufferToTexture")
        );
    }

    /**
     * @returns {GPUTextureFormat} Preferred format for storage textures.
     * The only possible values are `"rgba8unorm"` and `"bgra8unorm"`.
     */
    get PreferredStorageFormat()
    {
        return this.#Device.features.has("bgra8unorm-storage") && this.#PreferredCanvasFormat || "rgba8unorm";
    }

    /** @param {Renderer} renderer - `Renderer` instance required in some methods */
    set Renderer(renderer)
    {
        this.#Renderer = renderer;
    }

    /** Destroy the multisample texture created in [CreateMultisampleTexture](#createmultisampletexture). */
    Destroy()
    {
        return this.#Multisample = this.#Multisample?.destroy();
    }
}
