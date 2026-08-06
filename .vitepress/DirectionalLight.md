[UWAL](Modules.md) / DirectionalLight

## Classes

<a id="directional"></a>

### Directional

A light used to radiate in a specific direction. It is positioned infinitely far away, and its rays are parallel.

#### See

[Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.

#### Extends

- [`Light`](Light.md#abstract-light)

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Directional(
   direction?, 
   color?, 
   label?): Directional;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `direction?` | `Float32Array`\<`ArrayBufferLike`\> | `undefined` | Light direction. Defaults to `[0, -1, 0]`. |
| `color?` | [`ColorParam`](Color.md#colorparam) | `undefined` | Light color. Defaults to white. |
| `label?` | `string` | `"Directional"` | Light name. |

###### Returns

[`Directional`](#directional)

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
| `uniformName?` | `string` | `"DirectionalLight"` | Uniform buffer name. |

###### Returns

`GPUBuffer`

###### Overrides

[`Light`](Light.md#abstract-light).[`SetRenderPipeline`](Light.md#setrenderpipeline)

<a id="setdirectionfrom"></a>

##### SetDirectionFrom()

```ts
SetDirectionFrom(pitch, yaw): void;
```

Compute the light direction from angles in radians.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pitch` | `number` | Light elevation. |
| `yaw` | `number` | Compass direction. |

###### Returns

`void`

<a id="lookat"></a>

##### LookAt()

```ts
LookAt(target, position): void;
```

Set the light direction to point at the specified point in 3D space.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `Float32Array`\<`ArrayBufferLike`\> | Point in 3D space to look at. |
| `position` | `Float32Array`\<`ArrayBufferLike`\> | Approximate light position. |

###### Returns

`void`

#### Accessors

<a id="direction"></a>

##### Direction

###### Get Signature

```ts
get Direction(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

The direction of the light.

###### Set Signature

```ts
set Direction(direction): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `direction` | `Float32Array`\<`ArrayBufferLike`\> | Light direction. |

###### Returns

`void`
