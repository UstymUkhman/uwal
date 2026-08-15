[UWAL](Modules.md) / PointLight

## Classes

<a id="pointlight"></a>

### PointLight

A light used to radiate from one point in all directions.

#### See

[Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.

#### Extends

- [`Light`](Light.md#abstract-light)

#### Extended by

- [`SpotLight`](SpotLight.md#spotlight)

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new PointLight(
   position?, 
   color?, 
   label?): PointLight;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `position?` | `Float32Array`\<`ArrayBufferLike`\> | `undefined` | Light position. |
| `color?` | [`ColorParam`](Color.md#colorparam) | `undefined` | Light color. Defaults to white. |
| `label?` | `string` | `"PointLight"` | Light label. |

###### Returns

[`PointLight`](#pointlight)

###### Overrides

[`Light`](Light.md#abstract-light).[`constructor`](Light.md#constructor)

#### Methods

<a id="setrenderpipeline"></a>

##### SetRenderPipeline()

```ts
SetRenderPipeline(Pipeline, uniformName?): GPUBuffer;
```

Create and update an internal uniform buffer of this light's color, intensity, and position values.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | `undefined` | Pipeline using this light. |
| `uniformName?` | `string` | `"PointLight"` | Uniform buffer name. |

###### Returns

`GPUBuffer`

###### Overrides

[`Light`](Light.md#abstract-light).[`SetRenderPipeline`](Light.md#setrenderpipeline)

#### Accessors

<a id="position"></a>

##### Position

###### Get Signature

```ts
get Position(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

The position of the light.

###### Set Signature

```ts
set Position(position): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | `Float32Array`\<`ArrayBufferLike`\> | Light position. |

###### Returns

`void`
