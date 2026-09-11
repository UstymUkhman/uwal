[UWAL](Modules.md) / Texture

## Classes

<a id="texture"></a>

### Texture

Utility class to create and manage textures and samplers.

#### Methods

<a id="createsampler"></a>

##### CreateSampler()

```ts
CreateSampler(descriptor?): GPUSampler;
```

Create a new sampler from the `descriptor` object.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `descriptor?` | `GPUSamplerDescriptor` & `SamplerDescriptor` | `GPUSamplerDescriptor` object extended with optional properties: `addressModeUV` for width and height; `addressMode` is for all 3 dimensions; `minMagFilter` for min and mag, and `filter` for min, mag and `mipmapFilter`. |

###### Returns

`GPUSampler`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpudevice-createsampler](https://www.w3.org/TR/webgpu/#dom-gpudevice-createsampler)

<a id="createtexture"></a>

##### CreateTexture()

```ts
CreateTexture(descriptor): GPUTexture;
```

Create a new texture from the `descriptor` object.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `descriptor` | `Pick`\<`Partial`\<`GPUTextureDescriptor`\>, `"format"` \| `"usage"`\> & `Omit`\<`GPUTextureDescriptor`, `"format"` \| `"usage"`\> | `GPUTextureDescriptor` object with optional `format` and `usage` properties which default to [Device.PreferredCanvasFormat](./Device#preferredcanvasformat) and [TEXTURE.RENDER](./TextureUtils.html#texture), respectively. |

###### Returns

`GPUTexture`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture](https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture)

<a id="writetexture"></a>

##### WriteTexture()

```ts
WriteTexture(data, options): void;
```

Write `data` into a `GPUTexture` using `options`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `GPUAllowSharedBufferSource` | Buffer data to write. |
| `options` | `GPUTexelCopyTextureInfo` & `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & `GPUTexelCopyBufferLayout` | A union of the `destination`, `dataLayout` and `size` arguments of the `GPUQueue.writeTexture()` method. |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpuqueue-writetexture](https://www.w3.org/TR/webgpu/#dom-gpuqueue-writetexture)

<a id="createstoragetexture"></a>

##### CreateStorageTexture()

```ts
CreateStorageTexture(descriptor?): GPUTexture;
```

Create a new storage texture.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `descriptor` | `Pick`\<`Partial`\<`GPUTextureDescriptor`\>, `"format"` \| `"usage"` \| `"size"`\> & `Omit`\<`GPUTextureDescriptor`, `"format"` \| `"usage"` \| `"size"`\> | `GPUTextureDescriptor` object with optional `format`, `usage` and `size` properties which default to [Device.PreferredCanvasFormat](./Device#preferredcanvasformat), [TEXTURE.STORAGE](./TextureUtils.html#texture), and [Renderer.CanvasSize](./Renderer#canvassize) respectively. |

###### Returns

`GPUTexture`

<a id="createtexturefromsource"></a>

##### CreateTextureFromSource()

```ts
CreateTextureFromSource(source, descriptor?): GPUTexture;
```

Create a new texture using a `GPUTexture` or any valid image source. Texture's `size` and `mipLevelCount`
properties are authomatically calculated if not defined explicitly in the `descriptor` object.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `GPUSourceTexture` | `GPUTexture` or an image source. |
| `descriptor?` | `boolean` \| `TextureDescriptor` | [CreateTexture](#createtexture) descriptor object. |

###### Returns

`GPUTexture`

<a id="importexternaltexture"></a>

##### ImportExternalTexture()

```ts
ImportExternalTexture(
   source, 
   colorSpace?, 
   label?): GPUExternalTexture;
```

Create a new `GPUExternalTexture` from a video source.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `HTMLVideoElement` \| `VideoFrame` | Video source frame or element. |
| `colorSpace?` | `PredefinedColorSpace` | Color space to convert into. |
| `label?` | `string` | Texture label. |

###### Returns

`GPUExternalTexture`

###### See

 - [https://www.w3.org/TR/webgpu/#dom-gpudevice-importexternaltexture](https://www.w3.org/TR/webgpu/#dom-gpudevice-importexternaltexture)
 - [Video Color Grading](https://ustymukhman.github.io/uwal/dist/examples/examples.html#video-color-grading) for reference.

<a id="createimagebitmap"></a>

##### CreateImageBitmap()

```ts
CreateImageBitmap(
   source, 
   options?, 
requestOptions?): Promise<ImageBitmap>;
```

Create a bitmap image from a valid source path.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `string` | Image source path. |
| `options?` | `ImageBitmapOptions` | Bitmap options, defaults to `{colorSpaceConversion: "none"}`. |
| `requestOptions?` | `RequestInit` | `fetch` request options. |

###### Returns

`Promise`\<`ImageBitmap`\>

###### See

[https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap)

<a id="createmultisampletexture"></a>

##### CreateMultisampleTexture()

```ts
CreateMultisampleTexture(
   force?, 
   sampleCount?, 
   label?): void;
```

Create and assign a multisampled texture to the [Renderer.MultisampleTexture](./Renderer#multisampletexture).

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force?` | `boolean` | `false` | Force a new texture to be created. |
| `sampleCount?` | `number` | `4` | Must be either `1` or `4`. |
| `label?` | `string` | `undefined` | Texture label. |

###### Returns

`void`

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.

<a id="copyimagetotexture"></a>

##### CopyImageToTexture()

```ts
CopyImageToTexture(source, options?): Promise<GPUTexture>;
```

Copy an image source into a texture and optionally generate mipmaps for it.
If `options.texture` is not provided, a new `GPUTexture` is created by default.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `GPUCopyExternalImageSource` | Image source. |
| `options?` | `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & `CopyImageOptions` | Defaults to `{create: true, flipY: true}`. |

###### Returns

`Promise`\<`GPUTexture`\>

###### See

[https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture](https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture)

###### Throws

`ERROR.TEXTURE_NOT_FOUND` if called without `options.texture` when
`options.mipmaps` is `true` or `undefined` and `options.create` is falsy.

<a id="createcubetexture"></a>

##### CreateCubeTexture()

```ts
CreateCubeTexture(
   sources, 
   bitmapOptions?, 
   textureDescriptor?, 
   copyOptions?, 
requestOptions?): Promise<GPUTexture>;
```

Create a `"cube"` texture from `6` image sources. All images **must** have the same dimensions.
This method creates a bitmap image for each source and one cube texture and uses
that as the destination when copying bitmaps with `flipY` option set to `false`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `sources` | `string`[] | Array of `6` image source paths. |
| `bitmapOptions?` | `ImageBitmapOptions` | Bitmap options for [CreateImageBitmap](#createimagebitmap) method, defaults to `{colorSpaceConversion: "none"}`. |
| `textureDescriptor?` | `TextureDescriptor` | Texture descriptor for [CreateTextureFromSource](#createtexturefromsource) method, defaults to `{mipmaps: true}`. |
| `copyOptions?` | `CopyImageOptions` | Copy options for [CopyImageToTexture](#copyimagetotexture) method, method, defaults to `{flipY: false}`. |
| `requestOptions?` | `RequestInit` | `fetch` request options for [CreateImageBitmap](#createimagebitmap) method. |

###### Returns

`Promise`\<`GPUTexture`\>

###### See

 - [https://www.w3.org/TR/webgpu/#dom-gputextureviewdimension-cube](https://www.w3.org/TR/webgpu/#dom-gputextureviewdimension-cube)
 - [Environment maps](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#environment-maps)
and [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) for reference.

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.

<a id="copytexturetotexture"></a>

##### CopyTextureToTexture()

```ts
CopyTextureToTexture(options): void;
```

Copy `options.srcTexture` into `options.dstTexture`. If `options.dstTexture` is omitted,
a new texture is created from `options.srcTexture` using `options.create` descriptor.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & `CopyTextureOptions` | A union of the `source`, `destination`, and `copySize` arguments of the `GPUCommandEncoder.copyTextureToTexture()` method. |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetotexture](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetotexture)

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.

<a id="copytexturetobuffer"></a>

##### CopyTextureToBuffer()

```ts
CopyTextureToBuffer(options): void;
```

Copy `options.texture` into `options.buffer`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `CopyBufferOptions` & `GPUTexelCopyTextureInfo` & `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & `GPUTexelCopyBufferInfo` | A union of the `source`, `destination`, and `copySize` arguments of the `GPUCommandEncoder.copyTextureToBuffer()` method. |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer)

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.

<a id="copybuffertotexture"></a>

##### CopyBufferToTexture()

```ts
CopyBufferToTexture(options): void;
```

Copy `options.buffer` into `options.texture`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `GPUTexelCopyBufferInfo` & `CopyBufferOptions` & `GPUTexelCopyTextureInfo` & `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> | A union of the `source`, `destination`, and `copySize` arguments of the `GPUCommandEncoder.copyBufferToTexture()` method. |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertotexture](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertotexture)

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.

#### Accessors

<a id="preferredstorageformat"></a>

##### PreferredStorageFormat

###### Get Signature

```ts
get PreferredStorageFormat(): GPUTextureFormat;
```

Get the optimal [GPUTextureFormat](https://www.w3.org/TR/webgpu/#enumdef-gputextureformat) for storage textures.

###### Returns

`GPUTextureFormat`

The only possible values are `"rgba8unorm"` and `"bgra8unorm"`.

<a id="renderer"></a>

##### Renderer

###### Set Signature

```ts
set Renderer(renderer): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `renderer` | `RenderStage` | `Renderer` instance required in some methods. |

###### Returns

`void`
