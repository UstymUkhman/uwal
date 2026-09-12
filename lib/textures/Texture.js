/** @module Texture */

import { TEXTURE } from "./index";
import { Mipmaps } from "#/shaders";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

/**
 * Utility class to create and manage textures and samplers.
 *
 * @hideconstructor
 */
export class Texture
{
    /**
     * @typedef {Partial<GPUTextureDescriptor> & Partial<Record<"mipmaps", boolean>>} TextureDescriptor
     * @typedef {Partial<Record<"size", Iterable<GPUIntegerCoordinate>>>} OptionalSizeProperty
     * @typedef {GPUTexelCopyTextureInfo & Optional3DDictSize} CopyTextureDictSizeInfo
     * @typedef {Partial<GPUExtent3DDict> & OptionalSizeProperty} Optional3DDictSize
     * @typedef {GPUTexture | GPUCopyExternalImageSource} GPUSourceTexture
     *
     * @typedef {Object} SamplerDescriptor
     * @property {GPUAddressMode} [addressModeUV]
     * @property {GPUAddressMode} [addressMode]
     * @property {GPUFilterMode} [minMagFilter]
     * @property {GPUFilterMode} [filter]
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
     * @typedef {Object} CopyTextureOptions
     * @property {GPUSourceTexture} srcTexture
     * @property {GPUIntegerCoordinate} [srcMipLevel]
     * @property {GPUIntegerCoordinate} [dstMipLevel]
     * @property {GPUTextureAspect} [srcAspect]
     * @property {GPUTextureAspect} [dstAspect]
     * @property {TextureDescriptor} [create]
     * @property {GPUOrigin3D} [srcOrigin]
     * @property {GPUOrigin3D} [dstOrigin]
     * @property {GPUTexture} [dstTexture]
     *
     * @typedef {Object} CopyBufferOptions
     * @property {GPUSourceTexture} texture
     * @property {TextureDescriptor} [create]
     */

    /** @type {GPUDevice} */ #Device;
    /** @type {Renderer | undefined} */ #Renderer;
    /** @type {GPUTextureFormat} */ #PreferredCanvasFormat;

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

    /**
     * @param {GPUCopyExternalImageSource | GPUTexture} source
     */
    #GetSourceSize(source)
    {
        return source instanceof HTMLVideoElement
            ? [source.videoWidth, source.videoHeight]
            : source instanceof VideoFrame
            ? [source.codedWidth, source.codedHeight]
            : [source.width, source.height];
    }

    /**
     * @param {GPUCopyExternalImageSource | GPUTexture} source
     */
    #GetMipmapLevels(source)
    {
        const [width, height] = this.#GetSourceSize(source);
        return (Math.log2(Math.max(width, height)) | 0) + 1;
    }

    /**
     * @param {Optional3DDictSize} options
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
     * @param {GPUTexture} texture
     * @param {GPUSamplerDescriptor & SamplerDescriptor} descriptor
     * @param {(
     *     Pipeline: RenderPipeline, Sampler: GPUSampler, baseMipLevel: number, dimension?: GPUTextureViewDimension
     * ) => void} loop
     * @param {GPUTextureViewDimension} [bindingViewDimension]
     */
    async #CreateMipmaps(texture, descriptor, loop, bindingViewDimension)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a texture with mipmaps.");

        const Renderer = /** @type {Renderer} */ (this.#Renderer);
        const MipmapsSampler = this.CreateSampler(descriptor);
        const MipmapsPipeline = new Renderer.Pipeline();

        const MipmapsModule = MipmapsPipeline.CreateShaderModule(Mipmaps);
        const { textureBindingViewDimension = bindingViewDimension } = texture;
        const { MultisampleTexture, UseDepthStencilAttachment, RenderPassDescriptor } = Renderer;

        const pipelinesState = Renderer.Pipelines.map(Pipeline =>
        {
            const state = Pipeline.Active;
            Pipeline.Active = false;
            return state;
        });

        Renderer.UseDepthStencilAttachment = false;
        MipmapsPipeline.DestroyPassEncoder = true;
        MipmapsPipeline.UseTextureView = false;
        MipmapsPipeline.SetDrawParams(3, 1, 0);
        Renderer.MultisampleTexture = void 0;

        const entryPoint = textureBindingViewDimension?.includes("cube") && "fragmentCube"
            || textureBindingViewDimension === "2d-array" && "fragment2DArray" || "fragment2D";

        await Renderer.AddPipeline(MipmapsPipeline,
        {
            vertex: MipmapsPipeline.CreateVertexState(MipmapsModule),
            fragment: MipmapsPipeline.CreateFragmentState(MipmapsModule, entryPoint,
                MipmapsPipeline.CreateColorTargetState(void 0, void 0, texture.format)
            )
        });

        for (let baseMipLevel = 1; baseMipLevel < texture.mipLevelCount; ++baseMipLevel)
            loop(MipmapsPipeline, MipmapsSampler, baseMipLevel, textureBindingViewDimension);

        MipmapsPipeline.Destroy();
        Renderer.SubmitCommandBuffer();
        Renderer.CommandEncoder = void 0;
        Renderer.RemovePipeline(MipmapsPipeline);

        Renderer.MultisampleTexture = MultisampleTexture;
        Renderer.UseDepthStencilAttachment = UseDepthStencilAttachment;
        pipelinesState.forEach((state, s) => Renderer.Pipelines[s].Active = state);

        Renderer.CreatePassDescriptor(
            /** @type {GPURenderPassColorAttachment | GPURenderPassColorAttachment[]} */
            (RenderPassDescriptor.colorAttachments),
            RenderPassDescriptor.depthStencilAttachment,
            RenderPassDescriptor.label,
            RenderPassDescriptor.occlusionQuerySet,
            RenderPassDescriptor.timestampWrites,
            RenderPassDescriptor.maxDrawCount
        );
    }

    /**
     * @param {GPUTexture} texture
     */
    async #GenerateCubeMipmaps(texture)
    {
        return this.#CreateMipmaps(texture, { minMagFilter: "linear" }, (Pipeline, Sampler, baseMipLevel, dimension) =>
        {
            for (let l = 0; l < texture.depthOrArrayLayers; ++l)
            {
                Pipeline.SetBindGroupFromResources([
                    Sampler, texture.createView({
                        baseMipLevel: baseMipLevel - 1,
                        mipLevelCount: 1,
                        dimension
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

    /**
     * @param {GPUTexture} texture
     */
    async #GenerateMipmaps(texture)
    {
        return this.#CreateMipmaps(texture, { minFilter: "linear" }, (Pipeline, Sampler, baseMipLevel) =>
        {
            Pipeline.SetBindGroupFromResources([
                Sampler, texture.createView({ baseMipLevel: baseMipLevel - 1, mipLevelCount: 1 })
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
     * Create a new sampler from the `descriptor` object.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpudevice-createsampler}
     *
     * @param {GPUSamplerDescriptor & SamplerDescriptor} [descriptor] - `GPUSamplerDescriptor` object extended with
     * optional properties: `addressModeUV` for width and height; `addressMode` is for all 3 dimensions; `minMagFilter`
     * for min and mag, and `filter` for min, mag and `mipmapFilter`. Defaults to `{filter: "linear"}`.
     */
    CreateSampler(descriptor = { filter: "linear" })
    {
        const { addressModeUV, addressMode, minMagFilter, filter } = descriptor;

        if (addressModeUV && !addressMode) descriptor.addressModeU = descriptor.addressModeV = addressModeUV;
        if (addressMode) descriptor.addressModeU = descriptor.addressModeV = descriptor.addressModeW = addressMode;

        if (minMagFilter && !filter) descriptor.minFilter = descriptor.magFilter = minMagFilter;
        if (filter) descriptor.minFilter = descriptor.magFilter = descriptor.mipmapFilter = filter;

        return this.#Device.createSampler(descriptor);
    }

    /**
     * Create a new texture from the `descriptor` object.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture}
     *
     * @param {Pick<Partial<GPUTextureDescriptor>, "format" | "usage"> & Omit<GPUTextureDescriptor, "format" | "usage">}
     * descriptor - `GPUTextureDescriptor` object with optional `format` and `usage` properties which default to
     * [Device.PreferredCanvasFormat](./Device#preferredcanvasformat) and [TEXTURE.RENDER](./TextureUtils.html#texture),
     * respectively.
     */
    CreateTexture(descriptor)
    {
        const { textureBindingViewDimension: view = "2d" } = descriptor;
        const { label = "Texture", format = this.#PreferredCanvasFormat, usage = TEXTURE.RENDER } = descriptor;
        const dimension = /** @type {GPUTextureDimension} */ (["1d", "2d", "3d"].includes(view) && view || "2d");
        return this.#Device.createTexture({ label, format, usage, dimension, ...descriptor });
    }

    /**
     * Write `data` into a `GPUTexture` using `options`.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpuqueue-writetexture}
     *
     * @param {GPUAllowSharedBufferSource} data - Buffer data to write.
     * @param {CopyTextureDictSizeInfo & GPUTexelCopyBufferLayout} options - A union of the
     * `destination`, `dataLayout` and `size` arguments of the `GPUQueue.writeTexture()` method.
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
     * @throws `ERROR.DESCRIPTOR_SIZE_NOT_FOUND` if [Renderer](#renderer) and `size` parameter are not provided.
     *
     * @param {Pick<Partial<GPUTextureDescriptor>, "format" | "usage" | "size"> &
     *     Omit<GPUTextureDescriptor, "format" | "usage" | "size">
     * } descriptor - `GPUTextureDescriptor` object with optional `format`, `usage` and `size` properties which default
     * to [Device.PreferredCanvasFormat](./Device#preferredcanvasformat), [TEXTURE.STORAGE](./TextureUtils.html#texture),
     * and [Renderer.CanvasSize](./Renderer#canvassize) when [Renderer](#renderer) is provided.
     */
    CreateStorageTexture(descriptor = {})
    {
        const label = descriptor.label ?? "Storage Texture";
        const usage = TEXTURE.STORAGE | (descriptor.usage || 0);
        const { format = this.PreferredStorageFormat } = descriptor;

        !this.#Renderer && !descriptor.size && ThrowError(ERROR.DESCRIPTOR_SIZE_NOT_FOUND);
        const size = /** @type {GPUExtent3D} */ (descriptor.size || this.#Renderer?.CanvasSize);

        return this.CreateTexture({ label, size, format, ...descriptor, usage });
    }

    /**
     * Create a new texture using a `GPUTexture` or any valid image source. Texture's `size` and `mipLevelCount`
     * properties are authomatically calculated if not defined explicitly in the `descriptor` object.
     *
     * @param {GPUSourceTexture} source - `GPUTexture` or an image source.
     * @param {TextureDescriptor | boolean} [descriptor] - [CreateTexture](#createtexture) descriptor object.
     */
    CreateTextureFromSource(source, descriptor)
    {
        descriptor = /** @type {TextureDescriptor} */ (typeof descriptor === "object" && descriptor || {});

        const sizeArray = /** @type {Iterable<GPUIntegerCoordinate>} */ (descriptor.size);
        const sizeObject = /** @type {GPUExtent3DDict} */ (descriptor.size);

        const mipLevelCount = descriptor.mipLevelCount ?? (
            (descriptor.mipmaps ?? true) && this.#GetMipmapLevels(source) || void 0
        );

        const size = /** @type {GPUExtent3D} */ (Array.isArray(descriptor.size) || !descriptor.size
            ? sizeArray ?? this.#GetSourceSize(source) : [sizeObject.width, sizeObject.height]);

        return this.CreateTexture({ size, mipLevelCount, ...descriptor });
    }

    /**
     * Create a new `GPUExternalTexture` from a video source.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpudevice-importexternaltexture}
     * @see [Video Color Grading](https://ustymukhman.github.io/uwal/dist/examples/examples.html#video-color-grading) for reference.
     *
     * @param {VideoFrame | HTMLVideoElement} source - Video source frame or element.
     * @param {PredefinedColorSpace} [colorSpace] - Color space to convert into.
     * @param {string} [label] - Texture label.
     */
    ImportExternalTexture(source, colorSpace, label)
    {
        return this.#Device.importExternalTexture({ source, colorSpace, label });
    }

    /**
     * Create a bitmap image from a valid source path.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap}
     *
     * @param {string} source - Image source path.
     * @param {ImageBitmapOptions} [options] - Bitmap options, defaults to `{colorSpaceConversion: "none"}`.
     * @param {RequestInit} [requestOptions] - `fetch` request options.
     */
    async CreateImageBitmap(source, options, requestOptions)
    {
        const blob = await (await fetch(source, requestOptions)).blob();
        return createImageBitmap(blob, { colorSpaceConversion: "none", ...options });
    }

    /**
     * Create and assign a multisampled texture to the [Renderer.MultisampleTexture](./Renderer#multisampletexture).
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     *
     * @param {boolean} [force = false] - Force a new texture to be created.
     * @param {number} [sampleCount = 4] - Must be either `1` or `4`.
     * @param {string} [label = "Multisample Texture"] - Texture label.
     */
    CreateMultisampleTexture(force = false, sampleCount = 4, label)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a multisample texture.");

        const { MultisampleTexture, CurrentTexture: { width, height, format } } =
            /** @type {Renderer} */ (this.#Renderer);

        // A new multisample texture is created if the `force` flag is used, if the `Renderer`
        // doesn't have one already, or if its size is different from the current canvas texture.
        if (force || !MultisampleTexture || MultisampleTexture.width !== width || MultisampleTexture.height !== height)
        {
            MultisampleTexture?.destroy();

            /** @type {Renderer} */ (this.#Renderer).MultisampleTexture = this.CreateTexture(
            {
                usage: GPUTextureUsage.RENDER_ATTACHMENT,
                label: label ?? "Multisample Texture",
                size: [width, height],
                sampleCount,
                format
            });
        }
    }

    /**
     * Copy an image source into a texture and optionally generate mipmaps for it.
     * If `options.texture` is not provided, a new `GPUTexture` is created by default.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture}
     * @throws `ERROR.TEXTURE_NOT_FOUND` if called without `options.texture` when
     * `options.mipmaps` is `true` or `undefined` and `options.create` is falsy.
     *
     * @param {GPUCopyExternalImageSource} source - Image source.
     * @param {Optional3DDictSize & CopyImageOptions} [options] - Defaults to `{create: true, flipY: true}`.
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
            texture.depthOrArrayLayers === 1 && this.#GenerateMipmaps(texture) || this.#GenerateCubeMipmaps(texture)
        );

        return texture;
    }

    /**
     * Create a `"cube"` texture from `6` image sources. All images **must** have the same dimensions.
     * This method creates a bitmap image for each source and one cube texture and uses
     * that as the destination when copying bitmaps with `flipY` option set to `false`.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gputextureviewdimension-cube}
     * @see [Environment maps](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#environment-maps)
     * and [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) for reference.
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     *
     * @param {string[]} sources - Array of `6` image source paths.
     * @param {ImageBitmapOptions} [bitmapOptions] - Bitmap options for [CreateImageBitmap](#createimagebitmap) method,
     * defaults to `{colorSpaceConversion: "none"}`.
     * @param {TextureDescriptor} [textureDescriptor] - Texture descriptor for [CreateTextureFromSource](#createtexturefromsource)
     * method, defaults to `{mipmaps: true}`.
     * @param {CopyImageOptions} [copyOptions] - Copy options for [CopyImageToTexture](#copyimagetotexture) method,
     * method, defaults to `{flipY: false}`.
     * @param {RequestInit} [requestOptions] - `fetch` request options for [CreateImageBitmap](#createimagebitmap) method.
     */
    async CreateCubeTexture(sources, bitmapOptions, textureDescriptor, copyOptions, requestOptions)
    {
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "creating a cube texture.");

        const bitmaps = await Promise.all(sources.map(source =>
            this.CreateImageBitmap(source, bitmapOptions, requestOptions)
        ));

        const texture = this.CreateTextureFromSource(bitmaps[0],
        {
            size: [bitmaps[0].width, bitmaps[0].height, bitmaps.length],
            textureBindingViewDimension: "cube",
            ...textureDescriptor
        });

        await Promise.all(bitmaps.map((bitmap, b) => this.CopyImageToTexture(bitmap,
        {
            mipmaps: b === bitmaps.length - 1,
            destinationOrigin: [0, 0, b],
            flipY: false,
            texture,
            ...copyOptions
        })));

        return texture;
    }

    /**
     * Copy `options.srcTexture` into `options.dstTexture`. If `options.dstTexture` is omitted,
     * a new texture is created from `options.srcTexture` using `options.create` descriptor.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetotexture}
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     *
     * @param {Optional3DDictSize & CopyTextureOptions} options - A union of the `source`,
     * `destination`, and `copySize` arguments of the `GPUCommandEncoder.copyTextureToTexture()` method.
     */
    CopyTextureToTexture(options)
    {
        let { srcTexture, dstTexture, create } = options;
        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a texture to a texture.");
        !(srcTexture instanceof GPUTexture) && (srcTexture = this.CreateTextureFromSource(srcTexture, create));

        const { srcMipLevel, srcOrigin, srcAspect } = options;
        const { dstMipLevel, dstOrigin, dstAspect } = options;

        const [width, height] = this.#GetSourceSize(srcTexture);
        dstTexture ??= this.CreateTextureFromSource(srcTexture, create);

        /** @type {Renderer} */ (this.#Renderer).GetCommandEncoder(true).copyTextureToTexture(
            { texture: srcTexture, mipLevel: srcMipLevel, origin: srcOrigin, aspect: srcAspect },
            { texture: dstTexture, mipLevel: dstMipLevel, origin: dstOrigin, aspect: dstAspect },
            this.#GetSizeOptions({ width, height, ...options }, "CopyTextureToTexture")
        );
    }

    /**
     * Copy `options.texture` into `options.buffer`.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer}
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     *
     * @param {CopyBufferOptions & CopyTextureDictSizeInfo & GPUTexelCopyBufferInfo} options - A union of the
     * `source`, `destination`, and `copySize` arguments of the `GPUCommandEncoder.copyTextureToBuffer()` method.
     */
    CopyTextureToBuffer(options)
    {
        let { texture, bytesPerRow, create } = options;
        const [width, height] = this.#GetSourceSize(texture);

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a texture to a buffer.");
        !(texture instanceof GPUTexture) && (texture = this.CreateTextureFromSource(texture, create));

        const { mipLevel, origin, aspect, buffer, offset, rowsPerImage } = options;
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
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertotexture}
     * @throws `ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.
     *
     * @param {GPUTexelCopyBufferInfo & CopyBufferOptions & CopyTextureDictSizeInfo} options - A union of the
     * `source`, `destination`, and `copySize` arguments of the `GPUCommandEncoder.copyBufferToTexture()` method.
     */
    CopyBufferToTexture(options)
    {
        let { texture, bytesPerRow, create } = options;
        const [width, height] = this.#GetSourceSize(texture);

        !this.#Renderer && ThrowError(ERROR.RENDERER_NOT_FOUND, "copying a buffer to a texture.");
        !(texture instanceof GPUTexture) && (texture = this.CreateTextureFromSource(texture, create));

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
     * Get the optimal [GPUTextureFormat](https://www.w3.org/TR/webgpu/#enumdef-gputextureformat) for storage textures.
     *
     * @returns {GPUTextureFormat} The only possible values are `"rgba8unorm"` and `"bgra8unorm"`.
     */
    get PreferredStorageFormat()
    {
        return this.#Device.features.has("bgra8unorm-storage") && this.#PreferredCanvasFormat || "rgba8unorm";
    }

    /**
     * @param {Renderer} renderer - `Renderer` instance required in some methods.
     */
    set Renderer(renderer)
    {
        this.#Renderer = renderer;
    }
}
