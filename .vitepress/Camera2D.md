[UWAL](Modules.md) / Camera2D

## Classes

<a id="camera2d"></a>

### Camera2D

Camera manager class for scenes using 2D nodes and shapes.

#### Extends

- `Node2D`

#### Properties

<a id="culltest"></a>

##### CullTest

```ts
CullTest: 0 | 1 | 2 = 2;
```

Defaults to axis-aligned bounding box.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Camera2D(rendererWidth?, height?): Camera2D;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `rendererWidth?` | `number` \| `RenderStage` | `innerWidth` | Width of the viewport or a `Renderer` instance. |
| `height?` | `number` | `innerHeight` | Height of the viewport, optional when called with a `Renderer` instance. |

###### Returns

[`Camera2D`](#camera2d)

###### Overrides

```ts
Node2D.constructor
```

#### Methods

<a id="updateprojectionmatrix"></a>

##### UpdateProjectionMatrix()

```ts
UpdateProjectionMatrix(): void;
```

Compute the projection matrix and write the result into the corresponding uniform buffer if present.

###### Returns

`void`

<a id="setrenderpipeline"></a>

##### SetRenderPipeline()

```ts
SetRenderPipeline(Pipeline): GPUBuffer;
```

Create and update an internal uniform buffer of this camera's projection matrix.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Pipeline` | `RenderPipelineInstance` | Pipeline that uses this camera's projection. |

###### Returns

`GPUBuffer`

<a id="contains"></a>

##### Contains()

```ts
Contains(Shape): boolean;
```

Check if a shape is contained in the camera's viewport when cull testing is performed.
This method is called internally on every render when cull testing is enabled.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `Shape` | `Shape` | 2D shape to test for culling. |

###### Returns

`boolean`

Whether the shape is in the camera's viewport.

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy the internal projection matrix buffer.

###### Returns

`void`

#### Accessors

<a id="matrixbuffer"></a>

##### MatrixBuffer

###### Get Signature

```ts
get MatrixBuffer(): GPUBuffer | undefined;
```

###### Returns

`GPUBuffer` \| `undefined`

Matrix buffer created by the [SetRenderPipeline](#setrenderpipeline) method.

<a id="size"></a>

##### Size

###### Set Signature

```ts
set Size(size): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `size` | `number`[] \| `Float32Array`\<`ArrayBufferLike`\> | Camera's viewport width and height. |

###### Returns

`void`

<a id="position"></a>

##### Position

###### Get Signature

```ts
get Position(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

Camera's position in 2D space.

###### Set Signature

```ts
set Position(position): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | `Float32Array`\<`ArrayBufferLike`\> | Camera's position in 2D space. |

###### Returns

`void`

###### Overrides

```ts
Node2D.Position
```

<a id="positionz"></a>

##### PositionZ

###### Set Signature

```ts
set PositionZ(z): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `z` | `number` | Camera's position on the Z-axis used in light calculations. |

###### Returns

`void`

<a id="position3d"></a>

##### Position3D

###### Get Signature

```ts
get Position3D(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

Camera's position in 3D space.
