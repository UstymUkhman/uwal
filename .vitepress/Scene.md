[UWAL](Modules.md) / Scene

## Type Aliases

<a id="scenenode"></a>

### SceneNode

```ts
type SceneNode = Node2D | Node;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="camera"></a>

### Camera

```ts
type Camera = 
  | Camera2D
  | OrthographicCamera
  | PerspectiveCamera;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Classes

<a id="scene"></a>

### Scene

Content manager for objects rendered onto the `canvas` element.
Used to add, search, update, and remove nodes, 2D shapes, and 3D meshes within the rendering pipeline.

#### Properties

<a id="label"></a>

##### Label

```ts
Label: string;
```

Scene name.

<a id="children"></a>

##### Children

```ts
Children: SceneNode[] = [];
```

List of all elements in the scene graph.

<a id="maincamera"></a>

##### MainCamera

```ts
MainCamera: Camera | undefined;
```

Camera from the point of view of which the scene will be rendered.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Scene(label?): Scene;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `label?` | `string` | `"Scene"` | Scene name. |

###### Returns

[`Scene`](#scene)

#### Methods

<a id="add"></a>

##### Add()

```ts
Add(children): void;
```

Add any `Mesh`, `Shape` or `SceneNode` element(s) to the scene graph.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `children` | [`SceneNode`](#scenenode) \| [`SceneNode`](#scenenode)[] | Element(s) to add. |

###### Returns

`void`

<a id="remove"></a>

##### Remove()

```ts
Remove(children): void;
```

Remove any `Mesh`, `Shape` or `SceneNode` element(s) from the scene graph.
Only unlinking is performed, the `Destroy` method on removed element(s) is not called.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `children` | [`SceneNode`](#scenenode) \| [`SceneNode`](#scenenode)[] | Element(s) to remove. |

###### Returns

`void`

<a id="addmaincamera"></a>

##### AddMainCamera()

```ts
AddMainCamera(camera): void;
```

Add a [`Camera`](#camera) as a child of the scene and assign it to the [`MainCamera`](#maincamera) property.
To switch to a different camera, simply assign it to the `MainCamera` member.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `camera` | [`Camera`](#camera) | Camera to use. |

###### Returns

`void`

###### See

[Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.

<a id="updateworldmatrix"></a>

##### UpdateWorldMatrix()

```ts
UpdateWorldMatrix(): void;
```

Update local and world matrices of all elements in the scene graph.
Its use is discouraged since this method is called internally on every render.

###### Returns

`void`

<a id="traverse"></a>

##### Traverse()

```ts
Traverse(callback): void;
```

Perform the `callback` function on every element of the scene graph.
The scene itself will be **excluded** from the iteration.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `callback` | (`node`) => `unknown` | Function to call with the child element. |

###### Returns

`void`

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Call the `Destroy` method on every element of the scene graph if available.
Remove all [children](#children) and reset the `MainCamera` member.

###### Returns

`void`

#### Accessors

<a id="worldmatrix"></a>

##### WorldMatrix

###### Get Signature

```ts
get WorldMatrix(): Float32Array<ArrayBufferLike>;
```

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

The world matrix of the scene. Its use is discouraged since this
getter is called internally when updating the camera's view projection matrix.
