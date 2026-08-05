[UWAL](Modules.md) / PerspectiveCamera

## Classes

<a id="perspectivecamera"></a>

### PerspectiveCamera

Camera manager class for scenes using perspective projection.

#### See

[Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.

#### Extends

- [`Camera3D`](Camera3D.md#abstract-camera3d)

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new PerspectiveCamera(
   fov?, 
   near?, 
   far?, 
   rendererAspect?): PerspectiveCamera;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `fov?` | `number` | `60` | Field of view in degrees. Typically, optimal values range from `45` to `90` degrees. |
| `near?` | `number` | `1` | Distance to the near plane. |
| `far?` | `number` | `1e3` | Distance to the far plane. |
| `rendererAspect?` | `number` \| `RenderStage` | `...` | Aspect ratio or a `Renderer` instance. |

###### Returns

[`PerspectiveCamera`](#perspectivecamera)

###### Overrides

[`Camera3D`](Camera3D.md#abstract-camera3d).[`constructor`](Camera3D.md#constructor)

#### Methods

<a id="updateprojectionmatrix"></a>

##### UpdateProjectionMatrix()

```ts
UpdateProjectionMatrix(): void;
```

Compute the perspective projection and write the result into the corresponding uniform buffer if present.

###### Returns

`void`

###### Overrides

[`Camera3D`](Camera3D.md#abstract-camera3d).[`UpdateProjectionMatrix`](Camera3D.md#updateprojectionmatrix)

#### Accessors

<a id="fieldofview"></a>

##### FieldOfView

###### Get Signature

```ts
get FieldOfView(): number;
```

###### Returns

`number`

Camera's field of view in degrees.

###### Set Signature

```ts
set FieldOfView(fov): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fov` | `number` | Camera's field of view in degrees. |

###### Returns

`void`

<a id="aspectratio"></a>

##### AspectRatio

###### Get Signature

```ts
get AspectRatio(): number;
```

###### Returns

`number`

Camera's aspect ratio. Defaults to `innerWidth / innerHeight`.

###### Set Signature

```ts
set AspectRatio(rendererAspect): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `rendererAspect` | `number` \| `RenderStage` | Camera's aspect ratio or a `Renderer` instance to extract it from. |

###### Returns

`void`
