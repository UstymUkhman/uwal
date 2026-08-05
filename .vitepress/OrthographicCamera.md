[UWAL](Modules.md) / OrthographicCamera

## Classes

<a id="orthographiccamera"></a>

### OrthographicCamera

Camera manager class for scenes using orthographic projection.

#### See

[Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.

#### Extends

- [`Camera3D`](Camera3D.md#abstract-camera3d)

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new OrthographicCamera(
   near?, 
   far?, 
   top?, 
   rendererRight?, 
   bottom?, 
   left?): OrthographicCamera;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `near?` | `number` | `1` | Distance to the near plane. |
| `far?` | `number` | `1e3` | Distance to the far plane. |
| `top?` | `number` | `0` | Distance to the top plane. |
| `rendererRight?` | `number` \| `RenderStage` | `innerWidth` | Distance to the right plane or a `Renderer` instance. |
| `bottom?` | `number` | `innerHeight` | Distance to the bottom plane, optional when called with a `Renderer` instance. |
| `left?` | `number` | `0` | Distance to the left plane. |

###### Returns

[`OrthographicCamera`](#orthographiccamera)

###### Overrides

[`Camera3D`](Camera3D.md#abstract-camera3d).[`constructor`](Camera3D.md#constructor)

#### Methods

<a id="updateprojectionmatrix"></a>

##### UpdateProjectionMatrix()

```ts
UpdateProjectionMatrix(): void;
```

Compute the orthographic projection and write the result into the corresponding uniform buffer if present.

###### Returns

`void`

###### Overrides

[`Camera3D`](Camera3D.md#abstract-camera3d).[`UpdateProjectionMatrix`](Camera3D.md#updateprojectionmatrix)

#### Accessors

<a id="top"></a>

##### Top

###### Get Signature

```ts
get Top(): number;
```

###### Returns

`number`

Distance to the top plane of the frustum.

###### Set Signature

```ts
set Top(top): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `top` | `number` | Distance to the top plane. |

###### Returns

`void`

<a id="right"></a>

##### Right

###### Get Signature

```ts
get Right(): number;
```

###### Returns

`number`

Distance to the right plane of the frustum.

###### Set Signature

```ts
set Right(right): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `right` | `number` | Distance to the right plane. |

###### Returns

`void`

<a id="bottom"></a>

##### Bottom

###### Get Signature

```ts
get Bottom(): number;
```

###### Returns

`number`

Distance to the bottom plane of the frustum.

###### Set Signature

```ts
set Bottom(bottom): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bottom` | `number` | Distance to the bottom plane. |

###### Returns

`void`

<a id="left"></a>

##### Left

###### Get Signature

```ts
get Left(): number;
```

###### Returns

`number`

Distance to the left plane of the frustum.

###### Set Signature

```ts
set Left(left): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `left` | `number` | Distance to the left plane. |

###### Returns

`void`
