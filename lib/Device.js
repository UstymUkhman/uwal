import { GetParamArray } from "#/utils";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";

/**
 * @typedef {Pick<Partial<CanvasConfiguration>, "format"> & Omit<CanvasConfiguration, "format">} ConfigurationOptions
 * @typedef {GPURequestAdapterOptions & Record<"forceCompatibility", boolean | void>} RequestAdapterOptions
 * @typedef {Omit<GPUCanvasConfiguration, "device">} CanvasConfiguration
 * @exports CanvasConfiguration, ConfigurationOptions
 */

/**
 * @hideconstructor
 * Static class for requesting and managing the [GPUAdapter](https://www.w3.org/TR/webgpu/#gpuadapter) and the
 * [GPUDevice](https://www.w3.org/TR/webgpu/#gpudevice) instances with specified features and limits when provided.
 * It can clean up [GPUBuffer](https://www.w3.org/TR/webgpu/#gpubuffer),
 * [GPUTexture](https://www.w3.org/TR/webgpu/#gputexture), and [GPUQuerySet](https://www.w3.org/TR/webgpu/#gpuqueryset)
 * resources when no longer required and destroy the current `GPUDevice`.
 */
export class Device
{
    /**
     * Callback with a [GPUDeviceLostInfo](https://www.w3.org/TR/webgpu/#gpudevicelostinfo) argument to call when a
     * `GPUDevice` is lost. When present, prevents an [`ERROR.DEVICE_LOST`](./Errors#errorcause) from being thrown.
     *
     * @type {((detail: GPUDeviceLostInfo) => unknown) | undefined}
     */
    static OnLost;

    /**
     * @type {Omit<GPUDeviceDescriptor, "requiredFeatures"> & { requiredFeatures: Set<GPUFeatureName> }}
     */
    static #Descriptor = { requiredFeatures: new Set() };

    /** @type {GPUDevice | null} */ static #GPUDevice = null;
    /** @type {GPUAdapter | null} */ static #GPUAdapter = null;

    /**
     * @type {RequestAdapterOptions}
     */
    static #AdapterOptions = { forceFallbackAdapter: false, forceCompatibility: void 0 };

    static #RequestDevice()
    {
        return async () =>
        {
            const adapter = await this.Adapter;
            const { forceCompatibility, featureLevel } = this.#AdapterOptions;
            const { requiredFeatures, requiredLimits, label } = this.#Descriptor;
            const compatibilityRequest = featureLevel === "compatibility" && !forceCompatibility;

            // Request "core" features if available, even if "compatibility" mode was explicitly required.
            compatibilityRequest && adapter?.features.has("core-features-and-limits") &&
                requiredFeatures.add("core-features-and-limits");

            const device = await adapter?.requestDevice(
            {
                requiredFeatures: Array.from(requiredFeatures),
                defaultQueue: { label },
                requiredLimits
            });

            if (!device)
                return ThrowError(ERROR.DEVICE_NOT_FOUND);

            device.features.has("core-features-and-limits") &&
                console.info("Compatibility mode was requested, but this device supports core,",
                "so \"core-features-and-limits\" were automatically enabled."
            );

            device.lost.then(this.#DeviceLost);
            return this.#GPUDevice = device;
        };
    }

    static #RequestAdapter()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);

        return async () =>
        {
            const adapter = await navigator.gpu.requestAdapter(this.#AdapterOptions);
            !adapter && ThrowError(ERROR.ADAPTER_NOT_FOUND);
            return this.#GPUAdapter = adapter;
        };
    }

    /**
     * @param {GPUDeviceLostInfo} detail
     */
    static #DeviceLost(detail)
    {
        if (Device.OnLost) return Device.OnLost(detail);

        const message = (detail.message && ` | Message: ${detail.message}`) ?? ".";

        // If device is destroyed intentionally, `reason` will be `destroyed`.
        return ThrowError(ERROR.DEVICE_LOST, `Reason: ${detail.reason}` + message);
    }

    /**
     * Create and cache a new `GPUQuerySet`.
     * @see [GPUTiming](./GPUTiming) which uses a `"timestamp"` query set.
     *
     * @param {GPUQueryType} type - The type of queries managed by the `GPUQuerySet`.
     * @param {GPUSize32} count - The number of queries managed by the `GPUQuerySet`.
     * @param {string} [label] - `GPUQuerySet` label. Defaults to [DescriptorLabel](#descriptorlabel) when not provided.
     */
    static async CreateQuerySet(type, count, label)
    {
        return (await this.GPUDevice)?.createQuerySet({ type, count, label: label ?? this.#Descriptor.label });
    }

    /**
     * Remove initialized `GPUAdapter` and `GPUDevice` instances, reset internal state, and
     * destroy `GPUBuffer`, `GPUTexture`, and `GPUQuerySet` resources if passed as arguments.
     *
     * @param {GPUBuffer | GPUBuffer[]} [buffers] - Optional buffers to destroy.
     * @param {GPUTexture | GPUTexture[]} [textures] - Optional textures to destroy.
     * @param {GPUQuerySet | GPUQuerySet[]} [querySets] - Optional query sets to destroy.
     */
    static Destroy(buffers, textures, querySets)
    {
        this.#Descriptor.requiredFeatures.clear();
        this.#AdapterOptions = { forceFallbackAdapter: false, forceCompatibility: false };

        // Remove all GPUBuffers.
        buffers = /** @type {GPUBuffer[]} */ (GetParamArray(buffers));
        buffers.forEach(buffer => buffer?.destroy());
        buffers.splice(0);

        // Remove all GPUTextures.
        textures = /** @type {GPUTexture[]} */ (GetParamArray(textures));
        textures.forEach(texture => texture?.destroy());
        textures.splice(0);

        // Remove all GPUQuerySets.
        querySets = /** @type {GPUQuerySet[]} */ (GetParamArray(querySets));
        querySets.forEach(querySet => querySet?.destroy());
        querySets.splice(0);

        this.DescriptorLabel = this.DefaultQueue = this.RequiredLimits = void 0;
        this.#GPUAdapter = this.#GPUDevice = (this.#GPUDevice?.destroy() ?? null);
    }

    /**
     * Set optional [RequestAdapterOptions](#requestadapteroptions) when requesting a `GPUAdapter`.
     * Must be called **before** requesting a `GPUDevice`.
     * @see {@link https://www.w3.org/TR/webgpu/#adapter-selection}
     *
     * @param {RequestAdapterOptions} options - Standard `GPURequestAdapterOptions` with an optional `forceCompatibility`
     * flag to enable [compatibility mode](https://www.w3.org/TR/webgpu/#limit-compatibility-mode-default) even when
     * the target device supports core.
     */
    static set AdapterOptions(options)
    {
        this.#AdapterOptions = options;
    }

    /**
     * Set optional [features](https://www.w3.org/TR/webgpu/#features) when requesting a `GPUDevice`.
     * The request will fail if the `GPUAdapter` cannot provide them.
     * Must be called **before** initializing the [Renderer](./Renderer), [Computation](./Computation),
     * or [TextureUtils](./TextureUtils) or the [CreateQuerySet](#createqueryset) method call.
     *
     * @param {GPUFeatureName | GPUFeatureName[]} features - List of fearures to request from the adapter.
     */
    static async SetRequiredFeatures(features)
    {
        const adapterFeatures = (await this.Adapter)?.features;

        if (adapterFeatures)
        {
            features = /** @type {GPUFeatureName[]} */ (GetParamArray(features));

            features.forEach(feature => adapterFeatures.has(feature)
                ? this.#Descriptor.requiredFeatures.add(feature)
                : ThrowWarning(ERROR.FEATURE_NOT_FOUND,
                    `"${feature}".\nIt will be skipped when requesting a GPUDevice.`
                )
            );
        }

        return this.#Descriptor.requiredFeatures;
    }

    /**
     * Set optional device [limits](https://www.w3.org/TR/webgpu/#limits) when requesting a `GPUDevice`.
     * The request will fail if the `GPUAdapter` cannot provide them.
     * Must be called **before** initializing the [Renderer](./Renderer), [Computation](./Computation),
     * or [TextureUtils](./TextureUtils) or the [CreateQuerySet](#createqueryset) method call.
     *
     * @param {Record<string, GPUSize64> | undefined} requiredLimits - List of limits to request from the adapter.
     */
    static set RequiredLimits(requiredLimits)
    {
        this.#Descriptor.requiredLimits = requiredLimits;
    }

    /**
     * Set the descriptor for the default [GPUQueue](https://www.w3.org/TR/webgpu/#gpuqueue).
     *
     * @param {GPUQueueDescriptor | undefined} descriptor - Default queue descriptor object.
     */
    static set DefaultQueue(descriptor)
    {
        this.#Descriptor.defaultQueue = descriptor;
    }

    /**
     * Set the [descriptor label](https://www.w3.org/TR/webgpu/#gpudevicedescriptor) for the `GPUDevice`.
     *
     * @param {string | undefined} label - Device descriptor label.
     */
    static set DescriptorLabel(label)
    {
        this.#Descriptor.label = label;
    }

    /**
     * Get the optimal [GPUTextureFormat](https://www.w3.org/TR/webgpu/#enumdef-gputextureformat) for the current system.
     * @see {@link https://www.w3.org/TR/webgpu/#dom-gpu-getpreferredcanvasformat}
     *
     * @returns {GPUTextureFormat} The only possible values are `"rgba8unorm"` and `"bgra8unorm"`.
     */
    static get PreferredCanvasFormat()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);
        return navigator.gpu.getPreferredCanvasFormat();
    }

    /** @hidden */
    static get GPUDevice()
    {
        return (async () => this.#GPUDevice ?? (await this.#RequestDevice()()))();
    }

    /** @hidden */
    static get Adapter()
    {
        return (async () => this.#GPUAdapter ?? (await this.#RequestAdapter()()))();
    }

    /**
     * @returns {string} The current version of the library.
     */
    static get VERSION()
    {
        return VERSION;
    }
}
