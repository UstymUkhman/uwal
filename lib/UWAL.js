/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.7
 * @license MIT
 */

/**
 * @typedef {
       Pick<Partial<CanvasConfiguration>, "format"> &
       Omit<CanvasConfiguration, "format">
   } ConfigurationOptions
 *
 * @typedef {Omit<GPUCanvasConfiguration, "device">} CanvasConfiguration
 * @typedef {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} Renderer
 * @typedef {InstanceType<Awaited<ReturnType<UWAL.ComputePipeline>>>} Computation
 *
 * @exports ConfigurationOptions, Renderer, Computation
 */

import { RenderPipeline, ComputePipeline } from "@/pipelines";
import { ERROR, ThrowError, ThrowWarning } from "@/Errors";
import { Texture } from "@/textures";

export default class UWAL
{
    /** @type {GPUDevice | null} */ static #Device = null;
    /** @type {GPUAdapter | null} */ static #Adapter = null;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        powerPreference: undefined, forceFallbackAdapter: false
    }

    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnDeviceLost;

    /** @type {GPUDeviceDescriptor & { requiredFeatures?: GPUFeatureName[]; }} */ static #DeviceDescriptor =
    {
        label: undefined, requiredFeatures: undefined, requiredLimits: undefined
    };

    /** @param {string} [programName = ""] */
    static #SetDeviceDescriptorLabel(programName)
    {
        UWAL.#DeviceDescriptor.label ??= (programName && `${programName} Device` || "");
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} [programName = ""]
     * @param {ConfigurationOptions} [options = {}]
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

    /** @param {string} [programName = ""] */
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

    /** @param {Renderer} [renderer] */
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
     * @param {GPUQuerySet | GPUQuerySet[]} [querySets]
     */
    static Destroy(buffers, textures, querySets)
    {
        // Optionally remove all GPUBuffers:
        buffers = (/** @type {GPUBuffer[]} */ (Array.isArray(buffers) && buffers || [buffers]));
        buffers.forEach(buffer => buffer?.destroy());

        // Optionally remove all GPUTextures:
        textures = (/** @type {GPUTexture[]} */ (Array.isArray(textures) && textures || [textures]));
        textures.forEach(texture => texture?.destroy());

        // Optionally remove all GPUQuerySets:
        querySets = (/** @type {GPUQuerySet[]} */ (Array.isArray(querySets) && querySets || [querySets]));
        querySets.forEach(querySet => querySet?.destroy());

        // Destroy GPUDevice:
        UWAL.#Device?.destroy();

        // Reset to defaults:
        UWAL.#Adapter = UWAL.#Device = null;
        UWAL.PowerPreference = UWAL.ForceFallbackAdapter = undefined;
        UWAL.DescriptorLabel = UWAL.#DeviceDescriptor.requiredFeatures = UWAL.RequiredLimits = undefined;
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
        const availableFeatures = UWAL.#DeviceDescriptor.requiredFeatures ?? [];

        features = /** @type {GPUFeatureName[]} */ (Array.isArray(features) && features || [features]);

        features.forEach(feature => adapterFeatures.has(feature) ? availableFeatures.push(feature) : ThrowWarning(
            ERROR.FEATURE_NOT_FOUND, `"${feature}".\nIt will be skipped when requesting a GPUDevice.`
        ));

        return UWAL.#DeviceDescriptor.requiredFeatures = availableFeatures;
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
