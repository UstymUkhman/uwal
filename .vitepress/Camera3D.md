[UWAL](Modules.md) / Camera3D

## Classes

<a id="abstract-camera3d"></a>

### `abstract` Camera3D

Base class for the [orthographic](./OrthographicCamera) and the [perspective](./PerspectiveCamera) camera.

#### Extends

- `Node`

#### Extended by

- [`OrthographicCamera`](OrthographicCamera.md#orthographiccamera)
- [`PerspectiveCamera`](PerspectiveCamera.md#perspectivecamera)

#### Properties

<a id="culltest"></a>

##### CullTest

```ts
CullTest: 0 | 1 | 2 = 1;
```

Defaults to bounding sphere.

<a id="autoupdateworldmatrix"></a>

##### AutoUpdateWorldMatrix

```ts
AutoUpdateWorldMatrix: boolean = false;
```

Update the camera's view projection matrix every time the world matrix is updated.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Camera3D(
   near?, 
   far?, 
   label?): Camera3D;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `near?` | `number` | `1` | Distance to the near plane. |
| `far?` | `number` | `1e3` | Distance to the far plane. |
| `label?` | `string` | `undefined` | Name of the camera. |

###### Returns

[`Camera3D`](#abstract-camera3d)

###### Overrides

```ts
Node.constructor
```

#### Methods

<a id="updateworldmatrix"></a>

##### UpdateWorldMatrix()

```ts
UpdateWorldMatrix(force?): void;
```

Update the camera's world matrix buffer.
When the [AutoUpdateWorldMatrix](#autoupdateworldmatrix) or `force` is `true`,
the camera's world and view projection matrices are also updated.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force?` | `boolean` | `false` | Force the camera's matrices to be updated. |

###### Returns

`void`

###### Overrides

```ts
Node.UpdateWorldMatrix
```

<a id="updateprojectionmatrix"></a>

##### UpdateProjectionMatrix()

```ts
UpdateProjectionMatrix(): void;
```

Write the computed projection matrix into the corresponding uniform buffer if present.

###### Returns

`void`

<a id="updateviewprojectionmatrix"></a>

##### UpdateViewProjectionMatrix()

```ts
UpdateViewProjectionMatrix(updateWorldMatrix?): Float32Array<ArrayBufferLike>;
```

Compute the view-projection matrix and write the result into the corresponding uniform buffer if present.
This method also updates the camera's frustum planes used in cull testing.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `updateWorldMatrix?` | `boolean` | `true` | Update the camera's world matrix. |

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

<a id="getinverseviewprojectionmatrix"></a>

##### GetInverseViewProjectionMatrix()

```ts
GetInverseViewProjectionMatrix(translation?, dst?): Float32Array<ArrayBufferLike>;
```

Compute the inverse of the camera's view-projection matrix.
Optionally, reset the translation component of the matrix before inverting it.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `translation?` | `Float32Array`\<`ArrayBufferLike`\> | If passed, set the matrix translation to this vector. |
| `dst?` | `Float32Array`\<`ArrayBufferLike`\> | Destination matrix. A new one is created if omitted. |

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

###### See

[SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) lesson for reference.

<a id="lookat"></a>

##### LookAt()

```ts
LookAt(target, up?): void;
```

Rotate the camera to look at the specified point in 3D space.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `target` | `Float32Array`\<`ArrayBufferLike`\> | `Vec3` point to look at. |
| `up?` | `Float32Array`\<`ArrayBufferLike`\> | Camera's *up* vector. Defaults to `[0, 1, 0]`. |

###### Returns

`void`

<a id="setrenderpipeline"></a>

##### SetRenderPipeline()

```ts
SetRenderPipeline(Pipeline): GPUBuffer;
```

Create and update an internal uniform buffer of this camera's world, projection, and view-projection matrices.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | Pipeline that uses this camera's projection. |

###### Returns

`GPUBuffer`

<a id="contains"></a>

##### Contains()

```ts
Contains(Mesh): boolean;
```

Check if a mesh is contained in the camera's frustum when cull testing is performed.
This method is called internally on every render when cull testing is enabled.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Mesh` | `Mesh` | 3D mesh to test for culling. |

###### Returns

`boolean`

Whether the mesh is in the camera's frustum.

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy the internal matrices buffer.

###### Returns

`void`

#### Accessors

<a id="viewprojectionmatrix"></a>

##### ViewProjectionMatrix

###### Get Signature

```ts
get ViewProjectionMatrix(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

Camera's view projection matrix.

<a id="matrixbuffer"></a>

##### MatrixBuffer

###### Get Signature

```ts
get MatrixBuffer(): GPUBuffer | undefined;
```

###### Returns

`GPUBuffer` \| `undefined`

Matrix buffer created by the [SetRenderPipeline](#setrenderpipeline) method.

<a id="near"></a>

##### Near

###### Get Signature

```ts
get Near(): number;
```

###### Returns

`number`

Distance to the near plane of the frustum.

###### Set Signature

```ts
set Near(near): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `near` | `number` | Distance to the near plane. |

###### Returns

`void`

<a id="far"></a>

##### Far

###### Get Signature

```ts
get Far(): number;
```

###### Returns

`number`

Distance to the far plane of the frustum.

###### Set Signature

```ts
set Far(far): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `far` | `number` | Distance to the far plane. |

###### Returns

`void`
