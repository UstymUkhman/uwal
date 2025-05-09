/**
 * @typedef {BasePipeline & import("./pipelines/ComputePipeline").default} ComputePipeline
 * @typedef {BasePipeline & import("./pipelines/RenderPipeline").default} RenderPipeline
 * @typedef {Omit<GPUCanvasConfiguration, "device">} CanvasConfiguration
 * @typedef {import("./pipelines/BasePipeline").default} BasePipeline
 * @typedef {import("./textures/Texture").default} BaseTexture
 * @typedef {BaseTexture & { new(): BaseTexture }} Texture
 *
 * @typedef {ComputePipeline & { new(): ComputePipeline }} Computation
 * @typedef {RenderPipeline & { new(): RenderPipeline }} Renderer
 * @typedef {
       Pick<Partial<CanvasConfiguration>, "format"> &
       Omit<CanvasConfiguration, "format">
   } ConfigurationOptions
 *
 * @exports ConfigurationOptions, Computation, Renderer
 */

import { RenderPipeline, ComputePipeline } from "#/pipelines";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { Texture } from "#/textures";

export default class Device
{
    /** @type {GPUQuerySet[]} */ static #GPUQuerySets = [];
    /** @type {GPUDevice | null} */ static #GPUDevice = null;
    /** @type {GPUAdapter | null} */ static #GPUAdapter = null;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        powerPreference: undefined, forceFallbackAdapter: false
    }

    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnLost;

    /** @type {GPUDeviceDescriptor & { requiredFeatures: Set<GPUFeatureName> }} */ static #Descriptor =
    {
        label: undefined, requiredFeatures: new Set(), requiredLimits: undefined
    };

    /** @param {string} [programName = ""] */
    static #SetDescriptorLabel(programName)
    {
        this.#Descriptor.label ??= (programName && `${programName} Device` || "");
    }

    /**
     * @param {GPUQueryType} type
     * @param {GPUSize32} count
     * @returns {GPUQuerySet}
     */
    static async CreateQuerySet(type, count)
    {
        const device = await this.GPUDevice;
        const querySet = device.createQuerySet({ type, count });

        this.#GPUQuerySets.push(querySet);
        return querySet;
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} [programName = ""]
     * @param {ConfigurationOptions} [options = {}]
     *
     * @returns {Promise<Renderer>}
     */
    static RenderPipeline(canvas, programName = "", options = {})
    {
        options.format ??= this.PreferredCanvasFormat;
        this.#SetDescriptorLabel(programName);

        return (async () =>
        {
            const device = await this.GPUDevice;

            return new Proxy(RenderPipeline,
            {
                construct(Pipeline)
                {
                    return new Pipeline(device, programName, canvas, options);
                }
            });
        })();
    }

    /**
     * @param {string} [programName = ""]
     * @returns {Promise<Computation>}
     */
    static ComputePipeline(programName = "")
    {
        this.#SetDescriptorLabel(programName);

        return (async () =>
        {
            const device = await this.GPUDevice;

            return new Proxy(ComputePipeline,
            {
                construct(Pipeline)
                {
                    return new Pipeline(device, programName);
                }
            });
        })();
    }

    /**
     * @param {Renderer} [renderer]
     * @returns {Promise<Texture>}
     */
    static Texture(renderer)
    {
        return (async () =>
        {
            const device = await this.GPUDevice;

            return new Proxy(Texture,
            {
                construct(Texture)
                {
                    return new Texture(device, renderer);
                }
            });
        })();
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} [buffers]
     * @param {GPUTexture | GPUTexture[]} [textures]
     */
    static Destroy(buffers, textures)
    {
        // Remove all GPUQuerySets:
        this.#GPUQuerySets.forEach(querySet => querySet.destroy());

        // Optionally remove all GPUBuffers:
        buffers = (/** @type {GPUBuffer[]} */ (Array.isArray(buffers) && buffers || [buffers]));
        buffers.forEach(buffer => buffer?.destroy());

        // Optionally remove all GPUTextures:
        textures = (/** @type {GPUTexture[]} */ (Array.isArray(textures) && textures || [textures]));
        textures.forEach(texture => texture?.destroy());

        this.#GPUDevice?.destroy();
        this.#GPUQuerySets.splice(0);

        this.#Descriptor.requiredFeatures.clear();
        this.#GPUAdapter = this.#GPUDevice = null;

        this.DescriptorLabel = this.RequiredLimits = undefined;
        this.PowerPreference = this.ForceFallbackAdapter = undefined;
    }

    /** @param {GPUDeviceLostInfo} detail */
    static #DeviceLost(detail)
    {
        if (Device.OnLost) return Device.OnLost(detail);
        const message = (detail.message && ` | Message: ${detail.message}`) ?? ".";

        // If device is destroyed intentionally, `reason` will be `destroyed`.
        ThrowError(ERROR.DEVICE_LOST, `Reason: ${detail.reason}` + message);
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

    static #RequestDevice()
    {
        return async () =>
        {
            const { requiredFeatures, requiredLimits, label } = this.#Descriptor;

            const device = await (await this.Adapter).requestDevice({
                requiredFeatures, requiredLimits, defaultQueue: { label }
            });

            !device && ThrowError(ERROR.DEVICE_NOT_FOUND);
            device.lost.then(this.#DeviceLost);
            return this.#GPUDevice = device;
        };
    }

    /** @param {GPUPowerPreference} powerPreference */
    static set PowerPreference(powerPreference)
    {
        this.#AdapterOptions.powerPreference = powerPreference;
    }

    /** @param {boolean} forceFallbackAdapter */
    static set ForceFallbackAdapter(forceFallbackAdapter)
    {
        this.#AdapterOptions.forceFallbackAdapter = forceFallbackAdapter;
    }

    /** @param {string} label */
    static set DescriptorLabel(label)
    {
        this.#Descriptor.label = label;
    }

    /** @param {GPUFeatureName | GPUFeatureName[]} features */
    static async SetRequiredFeatures(features)
    {
        const adapterFeatures = (await this.Adapter).features;
        features = /** @type {GPUFeatureName[]} */ (Array.isArray(features) && features || [features]);

        features.forEach(feature => adapterFeatures.has(feature)
            ? this.#Descriptor.requiredFeatures.add(feature)
            : ThrowWarning(ERROR.FEATURE_NOT_FOUND, `"${feature}".\nIt will be skipped when requesting a GPUDevice.`)
        );

        return this.#Descriptor.requiredFeatures;
    }

    /** @param {Record<string, GPUSize64>} requiredLimits */
    static set RequiredLimits(requiredLimits)
    {
        this.#Descriptor.requiredLimits = requiredLimits;
    }

    static get PreferredCanvasFormat()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);
        return navigator.gpu.getPreferredCanvasFormat();
    }

    static get Adapter()
    {
        return (async () => this.#GPUAdapter ?? (await this.#RequestAdapter()()))();
    }

    static get GPUDevice()
    {
        return (async () => this.#GPUDevice ?? (await this.#RequestDevice()()))();
    }

    /**
     * @deprecated Use `Device.OnLost` instead.
     * @param {((detail: GPUDeviceLostInfo) => unknown) | undefined} onLost
     */
    static set OnDeviceLost(onLost)
    {
        this.OnLost = onLost;
    }

    /** @deprecated Use `Device.OnLost` instead. */
    static get OnDeviceLost()
    {
        return this.OnLost;
    }

    /** @deprecated Use `Device.GPUDevice` instead. */
    static get Device()
    {
        return this.GPUDevice;
    }

    static get VERSION()
    {
        return VERSION;
    }
}
