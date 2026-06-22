[UWAL](Modules.md) / Device

# Device

## Classes

### default

Defined in: [Device.js:19](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L19)

#### Classdesc

Middleware for `WebGPU` APIs. Used to create [Renderer](#renderer) and [Computation](#computation) stages,
[Texture](#texture) helpers and GPUQuerySets. It can require a GPUAdapter and a [GPUDevice](#gpudevice)
with specified features and limits and destroy resources like GPUBuffers,
GPUTextures GPUQuerySets and the current [GPUDevice](#gpudevice).

#### Constructors

##### Constructor

> **new default**(): [`default`](#default)

###### Returns

[`default`](#default)

#### Properties

##### OnLost

> `static` **OnLost**: ((`detail`) => `unknown`) \| `undefined`

Defined in: [Device.js:35](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L35)

###### Description

Callback with a GPUDeviceLostInfo argument to call when a [GPUDevice](#gpudevice) is lost.
When present, prevents an internal `ERROR.DEVICE_LOST` from being thrown.

#### Accessors

##### Adapter

###### Get Signature

> **get** `static` **Adapter**(): `Promise`\<`GPUAdapter` \| `null`\>

Defined in: [Device.js:297](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L297)

###### Description

Get cached GPUAdapter or require it from the GPU if not present.

###### Returns

`Promise`\<`GPUAdapter` \| `null`\>

##### AdapterOptions

###### Set Signature

> **set** `static` **AdapterOptions**(`options`): `void`

Defined in: [Device.js:219](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L219)

###### Description

Set adapter options when requiring a GPUAdapter.

###### See

[https://www.w3.org/TR/webgpu/#adapter-selection](https://www.w3.org/TR/webgpu/#adapter-selection)

###### Parameters

###### options

`GPURequestAdapterOptions`

###### Returns

`void`

##### DefaultQueue

###### Set Signature

> **set** `static` **DefaultQueue**(`descriptor`): `void`

Defined in: [Device.js:266](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L266)

###### Description

Set a descriptor for the default GPUQueue.

###### Parameters

###### descriptor

`GPUQueueDescriptor` \| `undefined`

###### Returns

`void`

##### DescriptorLabel

###### Set Signature

> **set** `static` **DescriptorLabel**(`label`): `void`

Defined in: [Device.js:275](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L275)

###### Description

Set default label when requesting a [GPUDevice](#gpudevice).

###### Parameters

###### label

`string` \| `undefined`

###### Returns

`void`

##### GPUDevice

###### Get Signature

> **get** `static` **GPUDevice**(): `Promise`\<`void` \| `GPUDevice`\>

Defined in: [Device.js:291](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L291)

###### Description

Get cached [GPUDevice](#gpudevice) or require it from GPUAdapter if not present.

###### Returns

`Promise`\<`void` \| `GPUDevice`\>

##### PreferredCanvasFormat

###### Get Signature

> **get** `static` **PreferredCanvasFormat**(): `GPUTextureFormat`

Defined in: [Device.js:284](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L284)

###### Description

Get an optimal GPUTextureFormat for the current system.

###### Returns

`GPUTextureFormat`

`"rgba8unorm"` or `"bgra8unorm"`.

##### RequiredLimits

###### Set Signature

> **set** `static` **RequiredLimits**(`requiredLimits`): `void`

Defined in: [Device.js:257](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L257)

###### Description

Set device limits when requiring a [GPUDevice](#gpudevice).
The request will fail if the GPUAdapter cannot provide these limits.
Must be set **before** calling `UWAL.Renderer`, `UWAL.Computation`, `UWAL.Texture` or `UWAL.CreateQuerySet`.

###### See

[https://www.w3.org/TR/webgpu/#limits](https://www.w3.org/TR/webgpu/#limits)

###### Parameters

###### requiredLimits

`Record`\<`string`, `number`\> \| `undefined`

###### Returns

`void`

##### VERSION

###### Get Signature

> **get** `static` **VERSION**(): `string`

Defined in: [Device.js:303](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L303)

###### Description

Current version of the library.

###### Returns

`string`

#### Methods

##### Computation()

> `static` **Computation**(`name?`): `Promise`\<`ComputeStage` & () => `ComputeStage`\>

Defined in: [Device.js:144](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L144)

###### Parameters

###### name?

`string` = `""`

###### Returns

`Promise`\<`ComputeStage` & () => `ComputeStage`\>

###### Description

Create a new ComputeStage to perform GPU computations.

##### CreateQuerySet()

> `static` **CreateQuerySet**(`type`, `count`, `label?`): `Promise`\<`GPUQuerySet` \| `undefined`\>

Defined in: [Device.js:109](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L109)

###### Parameters

###### type

`GPUQueryType`

###### count

`number`

###### label?

`string`

###### Returns

`Promise`\<`GPUQuerySet` \| `undefined`\>

###### Description

Create and cache a new GPUQuerySet.

###### See

Class `GPUTiming` which uses a `"timestamp"` query set.

##### Destroy()

> `static` **Destroy**(`buffers?`, `textures?`, `querySets?`): `void`

Defined in: [Device.js:190](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L190)

###### Parameters

###### buffers?

`GPUBuffer` \| `GPUBuffer`[]

###### textures?

`GPUTexture` \| `GPUTexture`[]

###### querySets?

`GPUQuerySet` \| `GPUQuerySet`[]

###### Returns

`void`

###### Description

Delete initialized GPUAdapter and [GPUDevice](#gpudevice),
reset GPURequestAdapterOptions and GPUDeviceDescriptor,
and optionally destroy GPUBuffer, GPUTexture and GPUQuerySet resources.

##### Renderer()

> `static` **Renderer**(`canvas`, `name?`, `options?`): `Promise`\<`RenderStage` & () => `RenderStage`\>

Defined in: [Device.js:120](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L120)

###### Parameters

###### canvas

`HTMLCanvasElement`

###### name?

`string` = `""`

###### options?

[`ConfigurationOptions`](#configurationoptions) = `{}`

###### Returns

`Promise`\<`RenderStage` & () => `RenderStage`\>

###### Description

Create a new RenderStage for the specified `canvas` element.

##### SetRequiredFeatures()

> `static` **SetRequiredFeatures**(`features`): `Promise`\<`Set`\<`GPUFeatureName`\>\>

Defined in: [Device.js:231](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L231)

###### Parameters

###### features

`GPUFeatureName` \| `GPUFeatureName`[]

###### Returns

`Promise`\<`Set`\<`GPUFeatureName`\>\>

###### Description

Set device features when requiring a [GPUDevice](#gpudevice).
The request will fail if the GPUAdapter cannot provide these features.
Must be set **before** calling `UWAL.Renderer`, `UWAL.Computation`, `UWAL.Texture` or `UWAL.CreateQuerySet`.

###### See

[https://www.w3.org/TR/webgpu/#features](https://www.w3.org/TR/webgpu/#features)

##### Texture()

> `static` **Texture**(`renderer?`): `Promise`\<`Texture` & () => `Texture`\>

Defined in: [Device.js:166](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L166)

###### Parameters

###### renderer?

`RenderStage`

###### Returns

`Promise`\<`Texture` & () => `Texture`\>

###### Description

Initialize a [Texture](#texture) class to create GPUTexture and GPUSampler resources.

## Type Aliases

### CanvasConfiguration

> **CanvasConfiguration** = `Omit`\<`GPUCanvasConfiguration`, `"device"`\>

Defined in: [Device.js:2](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L2)

#### Type Parameters

***

### ConfigurationOptions

> **ConfigurationOptions** = `Pick`\<`Partial`\<[`CanvasConfiguration`](#canvasconfiguration)\>, `"format"`\> & `Omit`\<[`CanvasConfiguration`](#canvasconfiguration), `"format"`\>

Defined in: [Device.js:3](https://github.com/UstymUkhman/uwal/blob/d9dd02f3c826af5171e210cefdea9e94b86088c2/lib/Device.js#L3)

#### Type Parameters
