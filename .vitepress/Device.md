[UWAL](Modules.md) / Device

## Type Aliases

<a id="configurationoptions"></a>

### ConfigurationOptions

```ts
type ConfigurationOptions = Pick<Partial<CanvasConfiguration>, "format"> & Omit<CanvasConfiguration, "format">;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="requestadapteroptions"></a>

### RequestAdapterOptions

```ts
type RequestAdapterOptions = GPURequestAdapterOptions & Record<"forceCompatibility", boolean | void>;
```

#### Type Parameters

| Type Parameter |
| ------ |

***

<a id="canvasconfiguration"></a>

### CanvasConfiguration

```ts
type CanvasConfiguration = Omit<GPUCanvasConfiguration, "device">;
```

#### Type Parameters

| Type Parameter |
| ------ |

## Classes

<a id="device"></a>

### Device

Static class used to request and manage your [GPUAdapter](https://www.w3.org/TR/webgpu/#gpuadapter) and
[GPUDevice](https://www.w3.org/TR/webgpu/#gpudevice|GPUDevice) with specified features and limits when provided.
It can cleanup resources like [GPUBuffer](https://www.w3.org/TR/webgpu/#gpubuffer)s,
[GPUTexture](https://www.w3.org/TR/webgpu/#gputexture)s and [GPUQuerySet](https://www.w3.org/TR/webgpu/#gpuqueryset)s
when no longer required and destroy the current `GPUDevice`.

#### Properties

<a id="onlost"></a>

##### OnLost

```ts
static OnLost: ((detail) => unknown) | undefined;
```

Callback with a [GPUDeviceLostInfo](https://www.w3.org/TR/webgpu/#gpudevicelostinfo) argument to call when a
`GPUDevice` is lost. When present, prevents an [`ERROR.DEVICE_LOST`](./Errors.md#errorcause) from being thrown.

#### Methods

<a id="createqueryset"></a>

##### CreateQuerySet()

```ts
static CreateQuerySet(
   type, 
   count, 
label?): Promise<GPUQuerySet | undefined>;
```

Create and cache a new [GPUQuerySet](https://www.w3.org/TR/webgpu/#gpuqueryset).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `type` | `GPUQueryType` | The type of queries managed by the `GPUQuerySet` |
| `count` | `number` | The number of queries managed by the `GPUQuerySet` |
| `label?` | `string` | `GPUQuerySet` label, defaults to [DescriptorLabel](./Device.md#descriptorlabel) when not provided |

###### Returns

`Promise`\<`GPUQuerySet` \| `undefined`\>

###### See

[GPUTiming](https://github.com/UstymUkhman/uwal/blob/main/lib/utils/GPUTiming.js) which uses a `"timestamp"` query set.

<a id="destroy"></a>

##### Destroy()

```ts
static Destroy(
   buffers?, 
   textures?, 
   querySets?): void;
```

Remove initialized `GPUAdapter` and `GPUDevice` instances, reset internal
[RequestAdapterOptions](./Device.md#requestadapteroptions)
and [GPUDeviceDescriptor](https://www.w3.org/TR/webgpu/#gpudevicedescriptor) objects,
and optionally destroy `GPUBuffer`, `GPUTexture` and `GPUQuerySet` resources if passed as arguments.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffers?` | `GPUBuffer` \| `GPUBuffer`[] | Optional buffers to destroy |
| `textures?` | `GPUTexture` \| `GPUTexture`[] | Optional textures to destroy |
| `querySets?` | `GPUQuerySet` \| `GPUQuerySet`[] | Optional query sets to destroy |

###### Returns

`void`

<a id="setrequiredfeatures"></a>

##### SetRequiredFeatures()

```ts
static SetRequiredFeatures(features): Promise<Set<GPUFeatureName>>;
```

Set optional [features](https://www.w3.org/TR/webgpu/#features) when requesting a `GPUDevice`.
The request will fail if the `GPUAdapter` cannot provide them.
Must be called **before** [`Renderer`](./Renderer.md), [`Computation`](./Computation.md),
[`TextureUtils`](./TextureUtils.md) and [`CreateQuerySet`](./Device.md#createqueryset).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `features` | `GPUFeatureName` \| `GPUFeatureName`[] | List of fearures to request from the adapter |

###### Returns

`Promise`\<`Set`\<`GPUFeatureName`\>\>

#### Accessors

<a id="adapteroptions"></a>

##### AdapterOptions

###### Set Signature

```ts
set static AdapterOptions(options): void;
```

Set optional [RequestAdapterOptions](./Device.md#requestadapteroptions) when requesting a `GPUAdapter`.
Must be called **before** requesting a `GPUDevice`.

###### See

[https://www.w3.org/TR/webgpu/#adapter-selection](https://www.w3.org/TR/webgpu/#adapter-selection)

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RequestAdapterOptions`](#requestadapteroptions) | Standard `GPURequestAdapterOptions` with an optional `forceCompatibility` flag to enable [compatibility mode](https://www.w3.org/TR/webgpu/#limit-compatibility-mode-default) even when the target device supports core |

###### Returns

`void`

<a id="requiredlimits"></a>

##### RequiredLimits

###### Set Signature

```ts
set static RequiredLimits(requiredLimits): void;
```

Set optional device [limits](https://www.w3.org/TR/webgpu/#limits) when requesting a `GPUDevice`.
The request will fail if the `GPUAdapter` cannot provide them.
Must be called **before** [`Renderer`](./Renderer.md), [`Computation`](./Computation.md),
[`TextureUtils`](./TextureUtils.md) and [`CreateQuerySet`](./Device.md#createqueryset).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `requiredLimits` | `Record`\<`string`, `number`\> \| `undefined` | List of limits to request from the adapter |

###### Returns

`void`

<a id="defaultqueue"></a>

##### DefaultQueue

###### Set Signature

```ts
set static DefaultQueue(descriptor): void;
```

Set the descriptor for the default [GPUQueue](https://www.w3.org/TR/webgpu/#gpuqueue).

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `descriptor` | `GPUQueueDescriptor` \| `undefined` | Default queue descriptor object |

###### Returns

`void`

<a id="descriptorlabel"></a>

##### DescriptorLabel

###### Set Signature

```ts
set static DescriptorLabel(label): void;
```

Set the [descriptor label](https://www.w3.org/TR/webgpu/#gpudevicedescriptor) for the `GPUDevice`.

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `label` | `string` \| `undefined` | Device descriptor label |

###### Returns

`void`

<a id="preferredcanvasformat"></a>

##### PreferredCanvasFormat

###### Get Signature

```ts
get static PreferredCanvasFormat(): GPUTextureFormat;
```

Get an optimal [GPUTextureFormat](https://www.w3.org/TR/webgpu/#enumdef-gputextureformat) for the current system.

###### See

[https://www.w3.org/TR/webgpu/#dom-gpu-getpreferredcanvasformat](https://www.w3.org/TR/webgpu/#dom-gpu-getpreferredcanvasformat)

###### Returns

`GPUTextureFormat`

Only possible formats are `"rgba8unorm"` and `"bgra8unorm"`.

<a id="version"></a>

##### VERSION

###### Get Signature

```ts
get static VERSION(): string;
```

###### Returns

`string`

The current version of the library.
