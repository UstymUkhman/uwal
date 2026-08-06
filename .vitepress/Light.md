[UWAL](Modules.md) / Light

## Classes

<a id="abstract-light"></a>

### `abstract` Light

Base class for [ambient](./AmbientLight), [directional](./DirectionalLight),
[point](./PointLight), and [spot](./SpotLight) lights.

#### Extended by

- [`Ambient`](AmbientLight.md#ambient)
- [`Directional`](DirectionalLight.md#directional)
- [`Point`](PointLight.md#point)

#### Properties

<a id="label"></a>

##### Label

```ts
Label: string;
```

Light name.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Light(color?, label?): Light;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `color?` | [`ColorParam`](Color.md#colorparam) | `undefined` | Light color. Defaults to white. |
| `label?` | `string` | `"Light"` | Light name. |

###### Returns

[`Light`](#abstract-light)

#### Methods

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy the internal uniform buffer.

###### Returns

`void`

<a id="setrenderpipeline"></a>

##### SetRenderPipeline()

```ts
protected SetRenderPipeline(Pipeline, uniformName): GPUBuffer;
```

Create and update an internal uniform buffer of this light's color and intensity values.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | Pipeline using this light. |
| `uniformName` | `string` | Uniform buffer name. |

###### Returns

`GPUBuffer`

#### Accessors

<a id="color"></a>

##### Color

###### Get Signature

```ts
get Color(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

The color of the light.

###### Set Signature

```ts
set Color(color): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `color` | [`ColorParam`](Color.md#colorparam) | Light color. |

###### Returns

`void`

<a id="intensity"></a>

##### Intensity

###### Get Signature

```ts
get Intensity(): number;
```

###### Returns

`number`

The intensity of the light.

###### Set Signature

```ts
set Intensity(intensity): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `intensity` | `number` | Light intensity. |

###### Returns

`void`
