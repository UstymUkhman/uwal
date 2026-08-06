[UWAL](Modules.md) / AmbientLight

## Classes

<a id="ambient"></a>

### Ambient

A light used to equally illuminate all meshes in the scene.
There should be only one source; it cannot cast shadows and does not have a direction.

#### See

[Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.

#### Extends

- [`Light`](Light.md#abstract-light)

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Ambient(color?, label?): Ambient;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `color?` | [`ColorParam`](Color.md#colorparam) | `undefined` | Light color. Defaults to white. |
| `label?` | `string` | `"Ambient"` | Light name. |

###### Returns

[`Ambient`](#ambient)

###### Overrides

[`Light`](Light.md#abstract-light).[`constructor`](Light.md#constructor)

#### Methods

<a id="setrenderpipeline"></a>

##### SetRenderPipeline()

```ts
SetRenderPipeline(Pipeline, uniformName?): GPUBuffer;
```

Create and update an internal uniform buffer of this light's color and intensity values.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | `undefined` | Pipeline using this light. |
| `uniformName?` | `string` | `"AmbientLight"` | Uniform buffer name. |

###### Returns

`GPUBuffer`

###### Overrides

[`Light`](Light.md#abstract-light).[`SetRenderPipeline`](Light.md#setrenderpipeline)
