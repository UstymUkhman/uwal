/**
 * @typedef {Omit<GPUCanvasConfiguration, "device">} CanvasConfiguration
 * @typedef {Pick<Partial<CanvasConfiguration>, "format"> & Omit<CanvasConfiguration, "format">} ConfigurationOptions
 *
 * @exports CanvasConfiguration, ConfigurationOptions
 */

import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { RenderStage, ComputeStage } from "#/stages";
import { GetParamArray } from "#/utils";
import { Texture } from "#/textures";

/**
 * @classdesc Middleware for `WebGPU` APIs. Used to create {@link Renderer} and {@link Computation} stages,
 * {@link Texture} helpers and {@link GPUQuerySet}s. It can require a {@link GPUAdapter} and a {@link GPUDevice}
 * with specified features and limits and destroy resources like {@link GPUBuffer}s,
 * {@link GPUTexture}s {@link GPUQuerySet}s and the current {@link GPUDevice}.
 */
export default class Device
{
    /** @type {GPUDevice | null} */ static #GPUDevice = null;
    /** @type {GPUAdapter | null} */ static #GPUAdapter = null;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        featureLevel: void 0, powerPreference: void 0, forceFallbackAdapter: false, xrCompatible: void 0
    };

    /** @type {GPUDeviceDescriptor & { requiredFeatures: Set<GPUFeatureName> }} */ static #Descriptor =
    {
        label: void 0, requiredFeatures: new Set(), requiredLimits: void 0, defaultQueue: void 0
    };

    /**
     * @description Callback with a {@link GPUDeviceLostInfo} argument to call when a {@link GPUDevice} is lost.
     * When present, prevents an internal `ERROR.DEVICE_LOST` from being thrown.
     * @type {((detail: GPUDeviceLostInfo) => unknown) | undefined}
     */
    static OnLost;

    /** @description Request a {@link GPUDevice} and cache it for future use. */
    static #RequestDevice()
    {
        return async () =>
        {
            const { requiredFeatures, requiredLimits, label } = this.#Descriptor;

            const device = await (await this.Adapter)?.requestDevice({
                requiredFeatures, requiredLimits, defaultQueue: { label }
            });

            if (!device) return ThrowError(ERROR.DEVICE_NOT_FOUND);

            device.lost.then(this.#DeviceLost);
            return this.#GPUDevice = device;
        };
    }

    /** @description Request a {@link GPUAdapter} and cache it for future use. */
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
     * @description Method invoked when `GPUDevice.lost` promise is fulfilled.
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
     * @description Set default label when requesting a {@link GPUDevice}.
     * @param {string} [name = ""]
     */
    static #SetDescriptorLabel(name)
    {
        this.#Descriptor.label ??= (name && `${name} Device` || "");
    }

    /**
     * @description Create and cache a new {@link GPUQuerySet}.
     * @see Class `GPUTiming` which uses a `"timestamp"` query set.
     * @param {GPUQueryType} type
     * @param {GPUSize32} count
     * @param {string} [label]
     */
    static async CreateQuerySet(type, count, label)
    {
        return (await this.GPUDevice)?.createQuerySet({ type, count, label: label ?? this.#Descriptor.label });
    }

    /**
     * @description Create a new {@link RenderStage} for the specified `canvas` element.
     * @param {HTMLCanvasElement} canvas
     * @param {string} [name = ""]
     * @param {ConfigurationOptions} [options = {}]
     */
    static Renderer(canvas, name = "", options = {})
    {
        this.#SetDescriptorLabel(name);

        options.format ??= this.PreferredCanvasFormat;

        return /** @type {Promise<Renderer & { new(): Renderer }>} */ ((async () =>
        {
            const device = await this.GPUDevice;

            return device && new Proxy(RenderStage,
            {
                construct(Stage)
                {
                    return new Stage(device, canvas, /** @type {CanvasConfiguration} */ (options), name);
                }
            });
        })());
    }

    /**
     * @description Create a new {@link ComputeStage} to perform GPU computations.
     * @param {string} [name = ""]
     */
    static Computation(name = "")
    {
        this.#SetDescriptorLabel(name);

        return /** @type {Promise<Computation & { new(): Computation }>} */ ((async () =>
        {
            const device = await this.GPUDevice;

            return device && new Proxy(ComputeStage,
            {
                construct(Stage)
                {
                    return new Stage(device, name);
                }
            });
        })());
    }

    /**
     * @description Initialize a {@link Texture} class to create {@link GPUTexture} and {@link GPUSampler} resources.
     * @param {Renderer} [renderer]
     */
    static Texture(renderer)
    {
        return /** @type {Promise<Texture & { new(): Texture }>} */ ((async () =>
        {
            const device = await this.GPUDevice;

            return device && new Proxy(Texture,
            {
                construct(Texture)
                {
                    return new Texture(device, renderer);
                }
            });
        })());
    }

    /**
     * @description Delete initialized {@link GPUAdapter} and {@link GPUDevice},
     * reset {@link GPURequestAdapterOptions} and {@link GPUDeviceDescriptor},
     * and optionally destroy {@link GPUBuffer}, {@link GPUTexture} and {@link GPUQuerySet} resources.
     * @param {GPUBuffer | GPUBuffer[]} [buffers]
     * @param {GPUTexture | GPUTexture[]} [textures]
     * @param {GPUQuerySet | GPUQuerySet[]} [querySets]
     */
    static Destroy(buffers, textures, querySets)
    {
        this.#Descriptor.requiredFeatures.clear();
        this.#AdapterOptions = { forceFallbackAdapter: false };

        // Remove all GPUBuffers:
        buffers = /** @type {GPUBuffer[]} */ (GetParamArray(buffers));
        buffers.forEach(buffer => buffer?.destroy());
        buffers.splice(0);

        // Remove all GPUTextures:
        textures = /** @type {GPUTexture[]} */ (GetParamArray(textures));
        textures.forEach(texture => texture?.destroy());
        textures.splice(0);

        // Remove all GPUQuerySets:
        querySets = /** @type {GPUQuerySet[]} */ (GetParamArray(querySets));
        querySets.forEach(querySet => querySet?.destroy());
        querySets.splice(0);

        this.DescriptorLabel = this.DefaultQueue = this.RequiredLimits = void 0;
        this.#GPUAdapter = this.#GPUDevice = (this.#GPUDevice?.destroy() ?? null);
    }

    /**
     * @description Set adapter options when requiring a {@link GPUAdapter}.
     * @see {@link https://www.w3.org/TR/webgpu/#adapter-selection}
     * @param {GPURequestAdapterOptions} options
     */
    static set AdapterOptions(options)
    {
        this.#AdapterOptions = options;
    }

    /**
     * @description Set device features when requiring a {@link GPUDevice}.
     * The request will fail if the {@link GPUAdapter} cannot provide these features.
     * Must be set **before** calling `UWAL.Renderer`, `UWAL.Computation`, `UWAL.Texture` or `UWAL.CreateQuerySet`.
     * @see {@link https://www.w3.org/TR/webgpu/#features}
     * @param {GPUFeatureName | GPUFeatureName[]} features
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
     * @description Set device limits when requiring a {@link GPUDevice}.
     * The request will fail if the {@link GPUAdapter} cannot provide these limits.
     * Must be set **before** calling `UWAL.Renderer`, `UWAL.Computation`, `UWAL.Texture` or `UWAL.CreateQuerySet`.
     * @see {@link https://www.w3.org/TR/webgpu/#limits}
     * @param {Record<string, GPUSize64> | undefined} requiredLimits
     */
    static set RequiredLimits(requiredLimits)
    {
        this.#Descriptor.requiredLimits = requiredLimits;
    }

    /**
     * @description Set a descriptor for the default {@link GPUQueue}.
     * @param {GPUQueueDescriptor | undefined} descriptor
     */
    static set DefaultQueue(descriptor)
    {
        this.#Descriptor.defaultQueue = descriptor;
    }

    /**
     * @description Set default label when requesting a {@link GPUDevice}.
     * @param {string | undefined} label
     */
    static set DescriptorLabel(label)
    {
        this.#Descriptor.label = label;
    }

    /**
     * @description Get an optimal {@link GPUTextureFormat} for the current system.
     * @returns {GPUTextureFormat} `"rgba8unorm"` or `"bgra8unorm"`.
     */
    static get PreferredCanvasFormat()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);
        return navigator.gpu.getPreferredCanvasFormat();
    }

    /** @description Get cached {@link GPUDevice} or require it from {@link GPUAdapter} if not present. */
    static get GPUDevice()
    {
        return (async () => this.#GPUDevice ?? (await this.#RequestDevice()()))();
    }

    /** @description Get cached {@link GPUAdapter} or require it from the {@link GPU} if not present. */
    static get Adapter()
    {
        return (async () => this.#GPUAdapter ?? (await this.#RequestAdapter()()))();
    }

    /** @description Current version of the library. */
    static get VERSION()
    {
        return VERSION;
    }
}
