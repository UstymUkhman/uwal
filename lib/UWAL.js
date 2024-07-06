/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.4
 * @license MIT
 */

import { RenderPipeline, ComputePipeline } from "@/pipelines";
import { ERROR, ThrowError } from "@/Errors";
import { Texture } from "@/textures";

export default class UWAL
{
    /** @type {GPUAdapter | null} */ static #Adapter = null;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        powerPreference: undefined, forceFallbackAdapter: false
    }

    /** @type {GPUDevice | null} */ static #Device = null;

    /** @type {GPUDeviceDescriptor} */ static #DeviceDescriptor =
    {
        label: undefined, requiredFeatures: [], requiredLimits: {}
    }

    /** @type {GPUSupportedLimits | undefined} */ static #AdapterLimits = undefined;

    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnDeviceLost;

    /**
     * @param {GPUPowerPreference} [powerPreference = undefined]
     * @param {boolean} [forceFallbackAdapter = false]
     */
    static SetAdapterOptions(powerPreference, forceFallbackAdapter = false)
    {
        UWAL.#AdapterOptions.powerPreference = powerPreference;
        UWAL.#AdapterOptions.forceFallbackAdapter = forceFallbackAdapter;
    }

    /**
     * @param {string} [label = undefined]
     * @param {Iterable<GPUFeatureName>} [requiredFeatures = []]
     * @param {Record<string, GPUSize64>} [requiredLimits = {}]
     */
    static SetDeviceDescriptor(label, requiredFeatures = [], requiredLimits = {})
    {
        UWAL.#DeviceDescriptor.label = label;
        UWAL.#DeviceDescriptor.requiredFeatures = requiredFeatures;
        UWAL.#DeviceDescriptor.requiredLimits = requiredLimits;
    }

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

    /** @param {string} [textureName = ""] */
    static Texture(textureName = "")
    {
        this.#SetDeviceDescriptorLabel(textureName);

        return (async () =>
        {
            const device = await UWAL.Device;

            return new Proxy(Texture,
            {
                construct(Texture)
                {
                    return new Texture(device, textureName);
                }
            });
        })();
    }

    /**
     * @param {GPUBuffer | GPUBuffer[]} [buffers = undefined]
     * @param {GPUTexture | GPUTexture[]} [textures = undefined]
     * @param {GPUQuerySet | GPUQuerySet[]} [querySets = undefined]
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
        UWAL.SetAdapterOptions();
        UWAL.SetDeviceDescriptor();
        UWAL.#AdapterLimits = undefined;
        UWAL.#Adapter = UWAL.#Device = null;
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
            this.#AdapterLimits = adapter.limits;
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

    static get AdapterLimits()
    {
        return this.#AdapterLimits;
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
