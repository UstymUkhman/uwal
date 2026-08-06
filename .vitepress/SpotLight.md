[UWAL](Modules.md) / SpotLight

## Classes

<a id="spot"></a>

### Spot

A light used to radiate from one point in one direction, along a cone increasing in size further away from the light.

#### See

[Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.

#### Extends

- [`Point`](PointLight.md#point)

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Spot(
   position?, 
   color?, 
   label?): Spot;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `position?` | `Float32Array`\<`ArrayBufferLike`\> | `undefined` | Light position. |
| `color?` | [`ColorParam`](Color.md#colorparam) | `undefined` | Light color. Defaults to white. |
| `label?` | `string` | `"Spot"` | Light name. |

###### Returns

[`Spot`](#spot)

###### Overrides

[`Point`](PointLight.md#point).[`constructor`](PointLight.md#constructor)

#### Methods

<a id="lookat"></a>

##### LookAt()

```ts
LookAt(target): Float32Array<ArrayBufferLike>;
```

Set the light to point at the specified point in 3D space.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `Float32Array`\<`ArrayBufferLike`\> | Point in 3D space to look at. |

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

<a id="setrenderpipeline"></a>

##### SetRenderPipeline()

```ts
SetRenderPipeline(Pipeline, uniformName?): GPUBuffer;
```

Create and update an internal uniform buffer of this light's color, intensity, position, direction and limit values.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | `undefined` | Pipeline using this light. |
| `uniformName?` | `string` | `"SpotLight"` | Uniform buffer name. |

###### Returns

`GPUBuffer`

###### Overrides

[`Point`](PointLight.md#point).[`SetRenderPipeline`](PointLight.md#setrenderpipeline)

#### Accessors

<a id="limit"></a>

##### Limit

###### Get Signature

```ts
get Limit(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

Inner and outer limit of the light. Everything inside the inner limit is fully illuminated, while objects
outside the outer limit receive no light. Light intensity between these limits is lerped using a `smoothstep` function.

###### Set Signature

```ts
set Limit(limit): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `limit` | `Float32Array`\<`ArrayBufferLike`\> | Light limits. |

###### Returns

`void`
