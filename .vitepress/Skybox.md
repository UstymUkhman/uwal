[UWAL](Modules.md) / Skybox

## Classes

<a id="skybox"></a>

### Skybox

Use a cube texture to be rendered as a scene background.

#### See

[Skybox / Materials](https://ustymukhman.github.io/uwal/dist/examples/examples.html#skybox-materials)
and [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) for reference.

#### Properties

<a id="camera"></a>

##### Camera

```ts
Camera: Camera3D;
```

Camera instance to view the skybox. Usually, it should be the same as [Scene.MainCamera](./Scene#maincamera).

<a id="updateviewprojectionmatrix"></a>

##### UpdateViewProjectionMatrix

```ts
UpdateViewProjectionMatrix: boolean = false;
```

Whether to update the `ViewProjectionMatrix` before inverting it.

###### See

[Camera3D.GetInverseViewProjectionMatrix](./Camera3D#getinverseviewprojectionmatrix) for reference.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new Skybox(
   Renderer, 
   Camera, 
   label?
): Skybox;
```

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Renderer` | `RenderStage` | `undefined` | `Renderer` instance to create the pipeline. |
| `Camera` | [`Camera3D`](Camera3D.md#abstract-camera3d) | `undefined` | Camera instance to view the skybox. |
| `label?` | `string` | `"Skybox"` | Skybox name. |

###### Returns

[`Skybox`](#skybox)

#### Methods

<a id="createpipeline"></a>

##### CreatePipeline()

```ts
CreatePipeline(pipelineDescriptor?): Promise<PipelineInstance>;
```

Create an internal render pipeline to draw the skybox.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `pipelineDescriptor?` | `RenderPipelineDescriptor` | Optional pipeline descriptor. |

###### Returns

`Promise`\<`PipelineInstance`\>

<a id="setcubetextureview"></a>

##### SetCubeTextureView()

```ts
SetCubeTextureView(texture, sampler): GPUTextureView;
```

Set a cube texture and a sampler to use for the skybox.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `texture` | `GPUTexture` | Cube texture to use for the skybox. |
| `sampler` | `GPUSampler` | Sampler to use for the cube texture. |

###### Returns

`GPUTextureView`

###### Throws

`ERROR.INVERSE_VIEW_PROJECTION_MATRIX_NOT_FOUND` if called before [CreatePipeline](#createpipeline).

<a id="render"></a>

##### Render()

```ts
Render(submit?): void;
```

Get the camera's view-projection matrix, update its buffer, and draw the skybox using an internal pipeline.

###### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `submit?` | `boolean` | `false` | Whether to destroy the render pass and submit the command buffer. |

###### Returns

`void`

###### Throws

`ERROR.INVERSE_VIEW_PROJECTION_MATRIX_NOT_FOUND` if called before [CreatePipeline](#createpipeline).

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy and remove the render pipeline, the inverse view-projection buffer, and reset the internal state.

###### Returns

`void`
