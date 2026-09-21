[UWAL](Modules.md) / MSDFText

## Classes

<a id="msdftext"></a>

### MSDFText

Utility class to write some text into a storage `GPUBuffer`. When combined with the `MSDFText` shader,
the buffer content can be outputted to a screen or into a `GPUTexture`. **Note:** This class will
probably be deprecated once [HTML in Canvas](https://html-in-canvas.dev/) gets widely adopted.

#### See

[MSDF Text](https://ustymukhman.github.io/uwal/dist/examples/examples.html#msdf-text) and
[Curtains](https://ustymukhman.github.io/uwal/dist/examples/examples.html#curtains) for reference.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new MSDFText(label?): MSDFText;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `label?` | `string` | `"MSDFText"` | Text label. |

###### Returns

[`MSDFText`](#msdftext)

#### Methods

<a id="createpipeline"></a>

##### CreatePipeline()

```ts
CreatePipeline(Renderer, descriptor?): Promise<PipelineInstance>;
```

Create an internal render pipeline to output the text.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Renderer` | `RenderStage` | `Renderer` instance to create the pipeline. |
| `descriptor?` | `PipelineDescriptor` & `RenderPipelineState` & `Record`\<`"renderBundleDescriptor"`, `RenderBundleDescriptor` \| `undefined`\> & `Record`\<`"colorTargets"`, `GPUColorTargetState` \| `GPUColorTargetState`[] \| `undefined`\> | Optional pipeline descriptor. |

###### Returns

`Promise`\<`PipelineInstance`\>

<a id="loadfont"></a>

##### LoadFont()

```ts
LoadFont(
   source, 
   generated?, 
   requestOptions?
): Promise<void>;
```

Load and use an [MSDFFont](./MSDFFont).

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `source` | `string` | `undefined` | Font source path. |
| `generated?` | `boolean` | `false` | Whether the font was generated [here](https://msdf-bmfont.donmccurdy.com/). |
| `requestOptions?` | `RequestInit` | `undefined` | `fetch` request options. |

###### Returns

`Promise`\<`void`\>

###### See

[https://github.com/UstymUkhman/uwal/issues/9](https://github.com/UstymUkhman/uwal/issues/9)

###### Throws

`ERROR.PIPELINE_NOT_FOUND` if called before [CreatePipeline](#createpipeline).

<a id="write"></a>

##### Write()

```ts
Write(
   text, 
   color?, 
   scale?, 
   centered?
): GPUBuffer;
```

Write a text string into a storage `GPUBuffer`.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `text` | `string` | `undefined` | Text to write. |
| `color?` | `ColorValue` | `0x000000` | Text color. |
| `scale?` | `number` | `0.01` | Text scale. |
| `centered?` | `boolean` | `false` | Whether the text should be centered. |

###### Returns

`GPUBuffer`

###### Throws

`ERROR.PIPELINE_NOT_FOUND` if called before [CreatePipeline](#createpipeline),
`ERROR.FONT_NOT_FOUND` if called before [LoadFont](#loadfont), and `ERROR.CAMERA_BUFFER_NOT_FOUND`
if a `PerspectiveCamera` buffer hasn't been set yet with [CameraMatrixBuffer](#cameramatrixbuffer).

<a id="settranslation"></a>

##### SetTranslation()

```ts
SetTranslation(translation, buffer): void;
```

Set the text translation.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `translation` | `Float32Array`\<`ArrayBufferLike`\> | Translation matrix. |
| `buffer` | `GPUBuffer` | Text buffer to update. |

###### Returns

`void`

<a id="setcolor"></a>

##### SetColor()

```ts
SetColor(color, buffer): void;
```

Set the text color.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `color` | `ColorValue` | Color value. |
| `buffer` | `GPUBuffer` | Text buffer to update. |

###### Returns

`void`

<a id="setscale"></a>

##### SetScale()

```ts
SetScale(scale, buffer): void;
```

Set the text scale.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale` | `number` | Scale value. |
| `buffer` | `GPUBuffer` | Text buffer to update. |

###### Returns

`void`

<a id="clear"></a>

##### Clear()

```ts
Clear(buffer?): void;
```

Destroy the text buffer and reset its color and scale values.
Remove pipeline's bind groups and reset its render bundles.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer?` | `GPUBuffer` | Text buffer to remove. |

###### Returns

`void`

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy and remove the render pipeline, destroy the font, and reset the internal state.

###### Returns

`void`

#### Accessors

<a id="cameramatrixbuffer"></a>

##### CameraMatrixBuffer

###### Set Signature

```ts
set CameraMatrixBuffer(buffer): void;
```

Set a `PerspectiveCamera` buffer to render the text.

###### See

[https://github.com/UstymUkhman/uwal/issues/9](https://github.com/UstymUkhman/uwal/issues/9)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `GPUBuffer` | Camera buffer. |

###### Returns

`void`

<a id="pipeline"></a>

##### Pipeline

###### Get Signature

```ts
get Pipeline(): RenderPipelineInstance | undefined;
```

###### Returns

`RenderPipelineInstance` \| `undefined`

Internal pipeline used to render the text.
