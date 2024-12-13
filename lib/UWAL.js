/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.9
 * @license MIT
 */

/**
 * @typedef {BasePipeline & import("./pipelines/ComputePipeline").default} UWALComputation
 * @typedef {BasePipeline & import("./pipelines/RenderPipeline").default} UWALRenderer
 * @typedef {Omit<GPUCanvasConfiguration, "device">} CanvasConfiguration
 * @typedef {import("./pipelines/BasePipeline").default} BasePipeline
 * @typedef {import("./textures/Texture").default} UWALTexture
 * @typedef {UWALTexture & { new(): UWALTexture }} Texture
 *
 * @typedef {UWALComputation & { new(): UWALComputation }} Computation
 * @typedef {UWALRenderer & { new(): UWALRenderer }} Renderer
 * @typedef {
       Pick<Partial<CanvasConfiguration>, "format"> &
       Omit<CanvasConfiguration, "format">
   } ConfigurationOptions
 *
 * @exports ConfigurationOptions, Renderer, Computation
 */

import { RenderPipeline, ComputePipeline } from "#/pipelines";
import { ERROR, ThrowError, ThrowWarning } from "#/Errors";
import { Texture } from "#/textures";

export default class UWAL
{
    /** @type {GPUQuerySet[]} */ static #QuerySets = [];
    /** @type {GPUDevice | null} */ static #Device = null;
    /** @type {GPUAdapter | null} */ static #Adapter = null;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        powerPreference: undefined, forceFallbackAdapter: false
    }

    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnDeviceLost;

    /** @type {GPUDeviceDescriptor & { requiredFeatures: Set<GPUFeatureName> }} */ static #DeviceDescriptor =
    {
        label: undefined, requiredFeatures: new Set(), requiredLimits: undefined
    };

    /** @param {string} [programName = ""] */
    static #SetDeviceDescriptorLabel(programName)
    {
        UWAL.#DeviceDescriptor.label ??= (programName && `${programName} Device` || "");
    }

    /**
     * @param {GPUQueryType} type
     * @param {GPUSize32} count
     * @returns {GPUQuerySet}
     */
    static async CreateQuerySet(type, count)
    {
        const device = await UWAL.Device;
        const querySet = device.createQuerySet({ type, count });

        UWAL.#QuerySets.push(querySet);
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
        options.format ??= UWAL.PreferredCanvasFormat;
        this.#SetDeviceDescriptorLabel(programName);

        return (async () =>
        {
            const device = await UWAL.Device;

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
        this.#SetDeviceDescriptorLabel(programName);

        return (async () =>
        {
            const device = await UWAL.Device;

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
            const device = await UWAL.Device;

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
        UWAL.#QuerySets.forEach(querySet => querySet.destroy());

        // Optionally remove all GPUBuffers:
        buffers = (/** @type {GPUBuffer[]} */ (Array.isArray(buffers) && buffers || [buffers]));
        buffers.forEach(buffer => buffer?.destroy());

        // Optionally remove all GPUTextures:
        textures = (/** @type {GPUTexture[]} */ (Array.isArray(textures) && textures || [textures]));
        textures.forEach(texture => texture?.destroy());

        UWAL.#Device?.destroy();
        UWAL.#QuerySets.splice(0);

        UWAL.#Adapter = UWAL.#Device = null;
        UWAL.#DeviceDescriptor.requiredFeatures.clear();

        UWAL.DescriptorLabel = UWAL.RequiredLimits = undefined;
        UWAL.PowerPreference = UWAL.ForceFallbackAdapter = undefined;
    }

    /** @param {GPUDeviceLostInfo} detail */
    static #DeviceLost(detail)
    {
        if (UWAL.OnDeviceLost) return UWAL.OnDeviceLost(detail);
        const message = (detail.message && ` | Message: ${detail.message}`) ?? ".";

        // If device is destroyed intentionally, `reason` will be `destroyed`.
        ThrowError(ERROR.DEVICE_LOST, `Reason: ${detail.reason}` + message);
    }

    static #RequestAdapter()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);

        return async () =>
        {
            const adapter = await navigator.gpu.requestAdapter(UWAL.#AdapterOptions);
            !adapter && ThrowError(ERROR.ADAPTER_NOT_FOUND);
            return UWAL.#Adapter = adapter;
        };
    }

    static #RequestDevice()
    {
        return async () =>
        {
            const { requiredFeatures, requiredLimits, label } = UWAL.#DeviceDescriptor;

            const device = await (await UWAL.Adapter).requestDevice({
                requiredFeatures, requiredLimits, defaultQueue: { label }
            });

            !device && ThrowError(ERROR.DEVICE_NOT_FOUND);
            device.lost.then(UWAL.#DeviceLost);
            return UWAL.#Device = device;
        };
    }

    /** @param {GPUPowerPreference} powerPreference */
    static set PowerPreference(powerPreference)
    {
        UWAL.#AdapterOptions.powerPreference = powerPreference;
    }

    /** @param {boolean} forceFallbackAdapter */
    static set ForceFallbackAdapter(forceFallbackAdapter)
    {
        UWAL.#AdapterOptions.forceFallbackAdapter = forceFallbackAdapter;
    }

    /** @param {string} label */
    static set DescriptorLabel(label)
    {
        UWAL.#DeviceDescriptor.label = label;
    }

    /** @param {GPUFeatureName | GPUFeatureName[]} features */
    static async SetRequiredFeatures(features)
    {
        const adapterFeatures = (await UWAL.Adapter).features;
        features = /** @type {GPUFeatureName[]} */ (Array.isArray(features) && features || [features]);

        features.forEach(feature => adapterFeatures.has(feature)
            ? UWAL.#DeviceDescriptor.requiredFeatures.add(feature)
            : ThrowWarning(ERROR.FEATURE_NOT_FOUND, `"${feature}".\nIt will be skipped when requesting a GPUDevice.`)
        );

        return UWAL.#DeviceDescriptor.requiredFeatures;
    }

    /** @param {Record<string, GPUSize64>} requiredLimits */
    static set RequiredLimits(requiredLimits)
    {
        UWAL.#DeviceDescriptor.requiredLimits = requiredLimits;
    }

    static get PreferredCanvasFormat()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);
        return navigator.gpu.getPreferredCanvasFormat();
    }

    static get Adapter()
    {
        return (async () => UWAL.#Adapter ?? (await UWAL.#RequestAdapter()()))();
    }

    static get Device()
    {
        return (async () => UWAL.#Device ?? (await UWAL.#RequestDevice()()))();
    }

    static get VERSION()
    {
        return VERSION;
    }
}
