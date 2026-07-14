[UWAL](Modules.md) / Scene

## Classes

<a id="scene"></a>

### Scene

#### Classdesc

Content manager for the `canvas` element. Used to add, search, update and remove
Meshes, Shapes, Nodes, and lights within the rendering pipeline.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Scene(label?): Scene;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `label?` | `string` | `"Scene"` | - |

###### Returns

[`Scene`](#scene)

#### Properties

<a id="children"></a>

##### Children

```ts
Children: SceneNode[] = [];
```

###### Description

Scene graph elements.

<a id="label"></a>

##### Label

```ts
Label: string;
```

###### Description

Name of the scene.

<a id="maincamera"></a>

##### MainCamera

```ts
MainCamera: Camera | undefined;
```

###### Description

Camera to render the scene.

#### Accessors

<a id="worldmatrix"></a>

##### WorldMatrix

###### Get Signature

```ts
get WorldMatrix(): Float32Array<ArrayBufferLike>;
```

###### Description

Get the world matrix of the scene. Its use is discouraged since
this getter is called internally when updating camera's view projection matrix.

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### Methods

<a id="add"></a>

##### Add()

```ts
Add(children): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `children` | `SceneNode` \| `SceneNode`[] | - |

###### Returns

`void`

###### Description

Add any Mesh, Shape or Node element(s) to the scene graph.

<a id="addmaincamera"></a>

##### AddMainCamera()

```ts
AddMainCamera(camera): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `camera` | [`Camera`](#camera) | - |

###### Returns

`void`

###### Description

Add a [Camera](#camera) as a child and assign it to the `MainCamera` to render all elements
from its perspective. To switch to a different camera, simply assign it to the `MainCamera` member.

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

###### Returns

`void`

###### Description

Iterate through all descendants and call `Destroy` method when available.
Remove all scene graph elements and reset the `MainCamera` member.

<a id="remove"></a>

##### Remove()

```ts
Remove(children): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `children` | `SceneNode` \| `SceneNode`[] | - |

###### Returns

`void`

###### Description

Remove any Mesh, Shape or Node element(s) from the scene graph.
Only unlinking is performed, `Destroy` method on removed element(s) is not called.

<a id="traverse"></a>

##### Traverse()

```ts
Traverse(callback): void;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | (`node`) => `unknown` | - |

###### Returns

`void`

###### Description

Iterate through all descendants by calling `SceneNode.Traverse` on every element of the scene graph.

<a id="updateworldmatrix"></a>

##### UpdateWorldMatrix()

```ts
UpdateWorldMatrix(): void;
```

###### Returns

`void`

###### Description

Update local and world matrices of all elements in the scene graph.
Its use is discouraged since this method is called internally on every render.

## Type Aliases

<a id="camera"></a>

### Camera

```ts
type Camera = Camera2D | PerspectiveCamera | OrthographicCamera;
```

#### Type Parameters

| Type Parameter |
| ------ |
