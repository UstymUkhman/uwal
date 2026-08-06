[UWAL](Modules.md) / Texture

## Type Aliases

<a id="addresses"></a>

### Addresses

```ts
type Addresses = Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", GPUAddressMode>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="filters"></a>

### Filters

```ts
type Filters = Readonly<Record<"NEAREST" | "LINEAR", GPUFilterMode>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="optionalgpuextent3dstrict"></a>

### OptionalGPUExtent3DStrict

```ts
type OptionalGPUExtent3DStrict = Partial<GPUExtent3DDict> & Partial<Record<"size", Iterable<GPUIntegerCoordinate>>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="texturedescriptor"></a>

### TextureDescriptor

```ts
type TextureDescriptor = Partial<GPUTextureDescriptor> & Partial<Record<"mipmaps", boolean>>;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Interfaces

<a id="samplerdescriptor"></a>

### SamplerDescriptor

#### Properties

<a id="addressmodeuv"></a>

##### addressModeUV?

```ts
optional addressModeUV?: GPUAddressMode;
```

<a id="addressmode"></a>

##### addressMode?

```ts
optional addressMode?: GPUAddressMode;
```

<a id="minmagfilter"></a>

##### minMagFilter?

```ts
optional minMagFilter?: GPUFilterMode;
```

<a id="filter"></a>

##### filter?

```ts
optional filter?: GPUFilterMode;
```

***

<a id="copyimageoptions"></a>

### CopyImageOptions

#### Properties

<a id="create"></a>

##### create?

```ts
optional create?: boolean | TextureDescriptor;
```

<a id="colorspace"></a>

##### colorSpace?

```ts
optional colorSpace?: PredefinedColorSpace;
```

<a id="miplevel"></a>

##### mipLevel?

```ts
optional mipLevel?: number;
```

<a id="destinationorigin"></a>

##### destinationOrigin?

```ts
optional destinationOrigin?: GPUOrigin3D;
```

<a id="premultipliedalpha"></a>

##### premultipliedAlpha?

```ts
optional premultipliedAlpha?: boolean;
```

<a id="sourceorigin"></a>

##### sourceOrigin?

```ts
optional sourceOrigin?: GPUOrigin2D;
```

<a id="aspect"></a>

##### aspect?

```ts
optional aspect?: GPUTextureAspect;
```

<a id="texture"></a>

##### texture?

```ts
optional texture?: GPUTexture;
```

<a id="mipmaps"></a>

##### mipmaps?

```ts
optional mipmaps?: boolean;
```

<a id="flipy"></a>

##### flipY?

```ts
optional flipY?: boolean;
```

***

<a id="copybufferoptions"></a>

### CopyBufferOptions

#### Properties

<a id="create-1"></a>

##### create?

```ts
optional create?: boolean | TextureDescriptor;
```

<a id="source"></a>

##### source?

```ts
optional source?: GPUCopyExternalImageSource;
```

***

<a id="copytextureoptions"></a>

### CopyTextureOptions

#### Properties

<a id="srcmiplevel"></a>

##### srcMipLevel?

```ts
optional srcMipLevel?: number;
```

<a id="dstmiplevel"></a>

##### dstMipLevel?

```ts
optional dstMipLevel?: number;
```

<a id="srcaspect"></a>

##### srcAspect?

```ts
optional srcAspect?: GPUTextureAspect;
```

<a id="dstaspect"></a>

##### dstAspect?

```ts
optional dstAspect?: GPUTextureAspect;
```

<a id="srcorigin"></a>

##### srcOrigin?

```ts
optional srcOrigin?: GPUOrigin3D;
```

<a id="dstorigin"></a>

##### dstOrigin?

```ts
optional dstOrigin?: GPUOrigin3D;
```

<a id="srctexture"></a>

##### srcTexture?

```ts
optional srcTexture?: GPUTexture;
```

<a id="dsttexture"></a>

##### dstTexture?

```ts
optional dstTexture?: GPUTexture;
```

## Classes

<a id="texture-1"></a>

### Texture

Utility class to manage textures and samplers.

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
| `descriptor?` | `GPUSamplerDescriptor` & [`SamplerDescriptor`](#samplerdescriptor) | `SamplerDescriptor.addressModeUV` is for width and height; `SamplerDescriptor.addressMode` is for all 3 dimensions; `SamplerDescriptor.minMagFilter` is for min and mag, and `SamplerDescriptor.filter` is for min, mag and `mipmapFilter`. |

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
| `descriptor` | `Pick`\<`Partial`\<`GPUTextureDescriptor`\>, `"usage"` \| `"format"`\> & `Omit`\<`GPUTextureDescriptor`, `"usage"` \| `"format"`\> | `format` and `usage` are optional and default to [Device.PreferredCanvasFormat](./Device#preferredcanvasformat) and [USAGE.RENDER](./TEXTURE#usage-1), respectively |

###### Returns

`GPUTexture`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture](https://www.w3.org/TR/webgpu/#dom-gpudevice-createtexture)

<a id="writetexture"></a>

##### WriteTexture()

```ts
WriteTexture(data, options): void;
```

Write `data` into a `GPUTexture`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `data` | `GPUAllowSharedBufferSource` | Data to write |
| `options` | `GPUTexelCopyTextureInfo` & `GPUTexelCopyBufferLayout` & `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> | A union of `destination`, `dataLayout` and `size` arguments |

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
| `descriptor` | `Pick`\<`Partial`\<`GPUTextureDescriptor`\>, `"usage"` \| `"size"` \| `"format"`\> & `Omit`\<`GPUTextureDescriptor`, `"usage"` \| `"size"` \| `"format"`\> | `format`, `usage` and `size` are optional and default to [PreferredStorageFormat](#preferredstorageformat), [USAGE.STORAGE](./TEXTURE#usage-1), and canvas size, respectively |

###### Returns

`GPUTexture`

<a id="createtexturefromsource"></a>

##### CreateTextureFromSource()

```ts
CreateTextureFromSource(source, descriptor?): GPUTexture;
```

Create a new texture using an existing `GPUTexture` or any valid external image sources.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `GPUTexture` \| `GPUCopyExternalImageSource` | `GPUTexture` or an image source reference |
| `descriptor?` | `boolean` \| [`TextureDescriptor`](#texturedescriptor) | Defaults to `{ mipmaps: true }` |

###### Returns

`GPUTexture`

<a id="importexternaltexture"></a>

##### ImportExternalTexture()

```ts
ImportExternalTexture(
   source, 
   label?, 
   colorSpace?): GPUExternalTexture;
```

Create a new `GPUExternalTexture` from a video source.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `source` | `HTMLVideoElement` \| `VideoFrame` | Video source reference |
| `label?` | `string` | Descriptor label |
| `colorSpace?` | `PredefinedColorSpace` | Predefined color space |

###### Returns

`GPUExternalTexture`

###### See

 - [Video Color Grading](https://ustymukhman.github.io/uwal/dist/examples/examples.html#video-color-grading)
example for reference.
 - [https://www.w3.org/TR/webgpu/#dom-gpudevice-importexternaltexture](https://www.w3.org/TR/webgpu/#dom-gpudevice-importexternaltexture)

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
| `source` | `string` | Image source path |
| `options?` | `ImageBitmapOptions` | Bitmap options |
| `requestOptions?` | `RequestInit` | `fetch` request options |

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
   label?): GPUTexture;
```

Create a multisampled texture for the [Renderer.MultisampleTexture](./Renderer#multisampletexture).

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force?` | `boolean` | `false` | Force a new texture to be created |
| `sampleCount?` | `number` | `4` | Must be either `1` or `4` |
| `label?` | `string` | `undefined` | Descriptor label |

###### Returns

`GPUTexture`

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
| `source` | `GPUCopyExternalImageSource` | Image source reference |
| `options?` | `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & [`CopyImageOptions`](#copyimageoptions) | Defaults to `{ create: true, flipY: true }` |

###### Returns

`Promise`\<`GPUTexture`\>

###### See

[https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture](https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture)

###### Throws

`ERROR.TEXTURE_NOT_FOUND` if called without `options.texture` and with
`options.create` being falsy when `options.mipmaps` is `true` or `undefined`.

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
| `sources` | `string`[] | Array of `6` valid source paths |
| `bitmapOptions?` | `ImageBitmapOptions` | Bitmap options for [CreateImageBitmap](#createimagebitmap) method |
| `textureDescriptor?` | [`TextureDescriptor`](#texturedescriptor) | Texture descriptor for [CreateTextureFromSource](#createtexturefromsource) method |
| `copyOptions?` | [`CopyImageOptions`](#copyimageoptions) | Copy options for [CopyImageToTexture](#copyimagetotexture) method |
| `requestOptions?` | `RequestInit` | `fetch` request options for [CreateImageBitmap](#createimagebitmap) method |

###### Returns

`Promise`\<`GPUTexture`\>

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided.

###### See

 - [Environment maps](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#environment-maps)
and [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) lessons for reference.
 - [https://www.w3.org/TR/webgpu/#dom-gputextureviewdimension-cube](https://www.w3.org/TR/webgpu/#dom-gputextureviewdimension-cube)

<a id="copytexturetotexture"></a>

##### CopyTextureToTexture()

```ts
CopyTextureToTexture(options): void;
```

Copy `options.srcTexture` into `options.dstTexture`. If `options.dstTexture` is omitted, it defaults to
`options.srcTexture`. If `options.srcTexture` is omitted, it defaults first to `options.source` and then,
if it's not defined, this method creates a new texture using `options.create` descriptor.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & [`CopyBufferOptions`](#copybufferoptions) & [`CopyTextureOptions`](#copytextureoptions) | Copy options |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetotexture](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetotexture)

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided and `ERROR.TEXTURE_NOT_FOUND`
if called without `options.srcTexture`, `options.source`, and with `options.create` being falsy.

<a id="copytexturetobuffer"></a>

##### CopyTextureToBuffer()

```ts
CopyTextureToBuffer(options): void;
```

Copy `options.texture` into `options.buffer`.
If `options.texture` is omitted, a new one is created using `options.source` reference.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `GPUTexelCopyBufferInfo` & `Partial`\<`GPUTexelCopyTextureInfo`\> & `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & [`CopyBufferOptions`](#copybufferoptions) | Copy options |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copytexturetobuffer)

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided and `ERROR.TEXTURE_NOT_FOUND`
if called without `options.texture`, `options.source`, and with `options.create` being falsy.

<a id="copybuffertotexture"></a>

##### CopyBufferToTexture()

```ts
CopyBufferToTexture(options): void;
```

Copy `options.buffer` into `options.texture`.
If `options.texture` is omitted, a new one is created using `options.source` reference.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | `GPUTexelCopyBufferInfo` & `Partial`\<`GPUTexelCopyTextureInfo`\> & `Partial`\<`GPUExtent3DDict`\> & `Partial`\<`Record`\<`"size"`, `Iterable`\<`number`, `any`, `any`\>\>\> & [`CopyBufferOptions`](#copybufferoptions) | Copy options |

###### Returns

`void`

###### See

[https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertotexture](https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-copybuffertotexture)

###### Throws

`ERROR.RENDERER_NOT_FOUND` if [Renderer](#renderer) is not provided and `ERROR.TEXTURE_NOT_FOUND`
if called without `options.texture`, `options.source`, and with `options.create` being falsy.

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): undefined;
```

Destroy the multisample texture created in [CreateMultisampleTexture](#createmultisampletexture).

###### Returns

`undefined`

#### Accessors

<a id="preferredstorageformat"></a>

##### PreferredStorageFormat

###### Get Signature

```ts
get PreferredStorageFormat(): GPUTextureFormat;
```

###### Returns

`GPUTextureFormat`

Preferred format for storage textures.
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
| `renderer` | `RenderStage` | `Renderer` instance required in some methods |

###### Returns

`void`
