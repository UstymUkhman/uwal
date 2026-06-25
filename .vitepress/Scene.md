[UWAL](Modules.md) / Scene

# Scene

## Classes

### Scene

Defined in: [Scene.js:15](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L15)

#### Classdesc

Content manager for the `canvas` element. Used to add, search, update and remove
Meshes, Shapes, Nodes, and lights within the rendering pipeline.

#### Constructors

##### Constructor

> **new Scene**(`label?`): [`Scene`](#scene)

Defined in: [Scene.js:44](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L44)

###### Parameters

###### label?

`string` = `"Scene"`

###### Returns

[`Scene`](#scene)

#### Properties

##### Children

> **Children**: `SceneNode`[] = `[]`

Defined in: [Scene.js:33](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L33)

###### Description

Scene graph elements.

##### Label

> **Label**: `string`

Defined in: [Scene.js:27](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L27)

###### Description

Name of the scene.

##### MainCamera

> **MainCamera**: [`Camera`](#camera) \| `undefined`

Defined in: [Scene.js:39](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L39)

###### Description

Camera to render the scene.

#### Accessors

##### WorldMatrix

###### Get Signature

> **get** **WorldMatrix**(): `Float32Array`\<`ArrayBufferLike`\>

Defined in: [Scene.js:118](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L118)

###### Description

Get the world matrix of the scene. Its use is discouraged since
this getter is called internally when updating camera's view projection matrix.

###### Returns

`Float32Array`\<`ArrayBufferLike`\>

#### Methods

##### Add()

> **Add**(`children`): `void`

Defined in: [Scene.js:53](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L53)

###### Parameters

###### children

`SceneNode` \| `SceneNode`[]

###### Returns

`void`

###### Description

Add any Mesh, Shape or Node element(s) to the scene graph.

##### AddMainCamera()

> **AddMainCamera**(`camera`): `void`

Defined in: [Scene.js:75](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L75)

###### Parameters

###### camera

[`Camera`](#camera)

###### Returns

`void`

###### Description

Add a [Camera](#camera) as a child and assign it to the `MainCamera` to render all elements
from its perspective. To switch to a different camera, simply assign it to the `MainCamera` member.

##### Destroy()

> **Destroy**(): `void`

Defined in: [Scene.js:103](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L103)

###### Returns

`void`

###### Description

Iterate through all descendants and call `Destroy` method when available.
Remove all scene graph elements and reset the `MainCamera` member.

##### Remove()

> **Remove**(`children`): `void`

Defined in: [Scene.js:64](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L64)

###### Parameters

###### children

`SceneNode` \| `SceneNode`[]

###### Returns

`void`

###### Description

Remove any Mesh, Shape or Node element(s) from the scene graph.
Only unlinking is performed, `Destroy` method on removed element(s) is not called.

##### Traverse()

> **Traverse**(`callback`): `void`

Defined in: [Scene.js:93](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L93)

###### Parameters

###### callback

(`node`) => `unknown`

###### Returns

`void`

###### Description

Iterate through all descendants by calling `SceneNode.Traverse` on every element of the scene graph.

##### UpdateWorldMatrix()

> **UpdateWorldMatrix**(): `void`

Defined in: [Scene.js:84](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L84)

###### Returns

`void`

###### Description

Update local and world matrices of all elements in the scene graph.
Its use is discouraged since this method is called internally on every render.

## Type Aliases

### Camera

> **Camera** = `Camera2D` \| `PerspectiveCamera` \| `OrthographicCamera`

Defined in: [Scene.js:3](https://github.com/UstymUkhman/uwal/blob/c74f949ffa8fd4f123b63a31d468555d87bceace/lib/Scene.js#L3)

#### Type Parameters
