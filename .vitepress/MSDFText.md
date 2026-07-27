[UWAL](Modules.md) / MSDFText

## Classes

<a id="msdftext"></a>

### MSDFText

Utility class to write some text onto a `GPUBuffer` and then use a `GPUTexture` to output it to a `canvas`.
**Note:** This class will probably get deprecated once [HTML in Canvas](https://html-in-canvas.dev/) is widely adopted.

#### See

[MSDF Text](https://ustymukhman.github.io/uwal/dist/examples/examples.html#msdf-text) and
[Curtains](https://ustymukhman.github.io/uwal/dist/examples/examples.html#curtains) examples for reference.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new MSDFText(label?): MSDFText;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `label?` | `string` | `"MSDFText"` | Name of the text |

###### Returns

[`MSDFText`](#msdftext)

#### Methods

<a id="createrenderpipeline"></a>

##### CreateRenderPipeline()

```ts
CreateRenderPipeline(Renderer, descriptor?): Promise<RenderPipelineInstance>;
```

Create an internal pipeline to render text.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Renderer` | `RenderStage` | `Renderer` instance to create the pipeline |
| `descriptor?` | `BasePipelineDescriptor` & `RenderPipelineState` & `Record`\<`"renderBundleDescriptor"`, `RenderBundleDescriptor` \| `undefined`\> & `Record`\<`"colorTargets"`, `GPUColorTargetState` \| `GPUColorTargetState`[] \| `undefined`\> | Additional pipeline settings |

###### Returns

`Promise`\<`RenderPipelineInstance`\>

<a id="loadfont"></a>

##### LoadFont()

```ts
LoadFont(
   url, 
   generated?, 
requestOptions?): Promise<MSDFFont>;
```

Load and use an [MSDFFont](./MSDFFont).

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `url` | `string` | `undefined` | URL to load the font from |
| `generated?` | `boolean` | `false` | Whether the font was generated with [this tool](https://msdf-bmfont.donmccurdy.com/) |
| `requestOptions?` | `RequestInit` | `undefined` | Optional `fetch` request options |

###### Returns

`Promise`\<`MSDFFont`\>

###### See

https://github.com/UstymUkhman/uwal/issues/9

<a id="write"></a>

##### Write()

```ts
Write(
   string, 
   color?, 
   scale?, 
   centered?): GPUBuffer;
```

Write a text string to a `GPUBuffer`.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `string` | `string` | `undefined` | String to write |
| `color?` | `ColorValue` | `0x000000` | Text color |
| `scale?` | `number` | `0.01` | Text scale |
| `centered?` | `boolean` | `false` | Set to `true` to center the text |

###### Returns

`GPUBuffer`

<a id="settranslation"></a>

##### SetTranslation()

```ts
SetTranslation(translation, textBuffer): void;
```

Set the text translation matrix.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `translation` | `Float32Array`\<`ArrayBufferLike`\> | Translation matrix |
| `textBuffer` | `GPUBuffer` | Text buffer to update |

###### Returns

`void`

<a id="setcolor"></a>

##### SetColor()

```ts
SetColor(color, textBuffer): void;
```

Set the text color.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `color` | `ColorValue` | Color value |
| `textBuffer` | `GPUBuffer` | Text buffer to update |

###### Returns

`void`

<a id="setscale"></a>

##### SetScale()

```ts
SetScale(scale, textBuffer): void;
```

Set the text scale.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `scale` | `number` | Scale value |
| `textBuffer` | `GPUBuffer` | Text buffer to update |

###### Returns

`void`

<a id="clear"></a>

##### Clear()

```ts
Clear(textBuffer?): void;
```

Destroy the text buffer and reset its color and scale.
Remove the pipeline's bind groups and reset its render bundles.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `textBuffer?` | `GPUBuffer` | Text buffer to remove |

###### Returns

`void`

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Remove the rendering pipeline, destroy the font, and reset the internal state.
Only unlinking is performed; the `Destroy` method on the removed pipeline is not called.

###### Returns

`void`

#### Accessors

<a id="cameramatrixbuffer"></a>

##### CameraMatrixBuffer

###### Set Signature

```ts
set CameraMatrixBuffer(cameraBuffer): void;
```

Set a `PrerspectiveCamera` buffer to render the text.

###### See

https://github.com/UstymUkhman/uwal/issues/9

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `cameraBuffer` | `GPUBuffer` | Camera buffer |

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

Pipeline used for text rendering.

<a id="font"></a>

##### Font

###### Get Signature

```ts
get Font(): MSDFFont | undefined;
```

###### Returns

`MSDFFont` \| `undefined`

[MSDFFont](./MSDFFont) instance.

###### Set Signature

```ts
set Font(font): void;
```

Dynamically set the text font. Called internaly by the [LoadFont](#loadfont) method.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `font` | `MSDFFont` | [MSDFFont](./MSDFFont) to use |

###### Returns

`void`
