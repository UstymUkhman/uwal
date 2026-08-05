[UWAL](Modules.md) / GPUTiming

## Classes

<a id="gputiming"></a>

### GPUTiming

Utility class levering the `"timestamp-query"` feature when available to monitor GPU performance.
Check the *WebGPU Timing Performance* [lesson](https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html)
and this [example](https://ustymukhman.github.io/uwal-webgpu-fundamentals/dist/#timing-performance)
for its usefulness, common pitfalls, and the basic usage.

#### Constructors

<a id="constructor"></a>

##### Constructor

```ts
new GPUTiming(stage): GPUTiming;
```

###### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stage` | `RenderStage` \| `ComputeStage` | `Computation` or `Renderer` instance used for monitoring. |

###### Returns

[`GPUTiming`](#gputiming)

###### Throws

`ERROR.TIMESTAMP_QUERY_NOT_FOUND` when `"timestamp-query"` feature is not supported.

#### Methods

<a id="resolveandsubmit"></a>

##### ResolveAndSubmit()

```ts
ResolveAndSubmit(): Promise<number>;
```

Copy timestamp results into a `GPUBuffer` and measure the duration between the current and the previous pass.
Must be called after `Computation.Compute` or `Renderer.Render` (with the `submit` flag set to `false`).

###### Returns

`Promise`\<`number`\>

GPU duration of the current pass. `NaN` if the measurement failed for configuration reasons.

<a id="destroy"></a>

##### Destroy()

```ts
Destroy(): void;
```

Destroy the query set and internal buffers.

###### Returns

`void`

#### Accessors

<a id="queryset"></a>

##### QuerySet

###### Get Signature

```ts
get QuerySet(): Promise<GPUQuerySet | undefined>;
```

###### Throws

`ERROR.TIMESTAMP_QUERY_NOT_FOUND` when `"timestamp-query"` feature is not supported.

###### Returns

`Promise`\<`GPUQuerySet` \| `undefined`\>

A query set to use in the [CreateTimestampWrites](./BaseStage#createtimestampwrites) method.

<a id="enabled"></a>

##### Enabled

###### Get Signature

```ts
get Enabled(): boolean;
```

###### Returns

`boolean`

Whether the `"timestamp-query"` feature is available after initialization.
