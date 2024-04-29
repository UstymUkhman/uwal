/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.1
 * @license MIT
 */

import { RenderPipeline, ComputePipeline } from "@/pipeline";
import { ERROR, EVENT } from "@/Constant";
import { ThrowError } from "@/Error";

export default class UWAL
{
    /** @type {GPUAdapter | null} */ static #Adapter = null;
    /** @type {GPUDevice | null} */ static #Device = null;

    /** @type {HTMLCanvasElement} */ static #Canvas;
    /** @type {GPUCanvasContext} */ static #Context;

    /** @type {GPUTextureFormat} */ static #PreferredCanvasFormat;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        powerPreference: undefined, forceFallbackAdapter: false
    }

    /** @type {GPUDeviceDescriptor} */ static #DeviceDescriptor =
    {
        label: "", requiredFeatures: [], requiredLimits: {}
    }

    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnDeviceLost;

    /** @param {GPUPowerPreference} [powerPreference = undefined] */
    static SetAdapterOptions(powerPreference = undefined, forceFallbackAdapter = false)
    {
        UWAL.#AdapterOptions.powerPreference = powerPreference;
        UWAL.#AdapterOptions.forceFallbackAdapter = forceFallbackAdapter;
    }

    /**
     * @param {Iterable<GPUFeatureName>} [requiredFeatures = []]
     * @param {Record<string, GPUSize64>} [requiredLimits = {}]
     */
    static SetDeviceDescriptor(label = "", requiredFeatures = [], requiredLimits = {})
    {
        UWAL.#DeviceDescriptor.label = label;
        UWAL.#DeviceDescriptor.requiredFeatures = requiredFeatures;
        UWAL.#DeviceDescriptor.requiredLimits = requiredLimits;
    }

    static SetCanvasSize(width = innerWidth, height = innerHeight)
    {
        !UWAL.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);
        !UWAL.#Device && ThrowError(ERROR.DEVICE_NOT_FOUND);

        const { maxTextureDimension2D } = UWAL.#Device.limits;

        width = Math.max(1, Math.min(width, maxTextureDimension2D));
        height = Math.max(1, Math.min(height, maxTextureDimension2D));

        if (UWAL.#Canvas.width !== width || UWAL.#Canvas.height !== height)
        {
            UWAL.#Canvas.height = height;
            UWAL.#Canvas.width = width;
        }
    }

    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} [commandEncoderLabel = ""]
     * @typedef {Object} ConfigurationOptions
     * @property {GPUTextureFormat} [format = undefined]
     * @property {GPUTextureUsageFlags} [usage = 0x10] - GPUTextureUsage.RENDER_ATTACHMENT
     * @property {Iterable<GPUTextureFormat>} [viewFormats = []]
     * @property {PredefinedColorSpace} [colorSpace = "srgb"]
     * @property {GPUCanvasAlphaMode} [alphaMode = "opaque"]
     * @param {ConfigurationOptions} [options = {}]
     */
    static RenderPipeline(canvas, commandEncoderLabel = "", options = {})
    {
        return (async () =>
        {
            const device = await UWAL.Device;
            const context = canvas.getContext("webgpu");

            !context && ThrowError(ERROR.CONTEXT_NOT_FOUND);

            const preferredFormat = options.format ?? UWAL.#PreferredCanvasFormat;
            const configuration = { ...options, format: preferredFormat };

            context.configure({ device, ...configuration });

            UWAL.#Canvas = canvas;
            UWAL.#Context = context;

            return new Proxy(RenderPipeline,
            {
                construct(Pipeline)
                {
                    return new Pipeline(device, commandEncoderLabel, preferredFormat);
                }
            });
        })();
    }

    /** @param {string} [commandEncoderLabel = ""] */
    static ComputePipeline(commandEncoderLabel = "")
    {
        return (async () =>
        {
            const device = await UWAL.Device;

            return new Proxy(ComputePipeline,
            {
                construct(Pipeline)
                {
                    return new Pipeline(device, commandEncoderLabel);
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

        // Remove GPUCanvasContext configuration:
        UWAL.#Context?.unconfigure();

        // Destroy GPUDevice:
        UWAL.#Device?.destroy();
    }

    static #RequestAdapter()
    {
        !navigator.gpu && ThrowError(ERROR.WEBGPU_NOT_SUPPORTED);

        UWAL.#PreferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

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

    /** @param {GPUDeviceLostInfo} detail */
    static #DeviceLost(detail)
    {
        if (UWAL.OnDeviceLost) return UWAL.OnDeviceLost(detail);

        UWAL.#Canvas.dispatchEvent(new CustomEvent(EVENT.DEVICE_LOST, { detail }));

        const message = (detail.message && ` | Message: ${detail.message}`) ?? ".";

        // If device is destroyed intentionally, `reason` will be `destroyed`.
        ThrowError(ERROR.DEVICE_LOST, ` Reason: ${detail.reason}` + message);
    }

    static get Adapter()
    {
        return (async () => UWAL.#Adapter ?? (await UWAL.#RequestAdapter()()))();
    }

    static get Device()
    {
        return (async () => UWAL.#Device ?? (await UWAL.#RequestDevice()()))();
    }

    /** @returns {HTMLCanvasElement | undefined} */
    static get Canvas()
    {
        return UWAL.#Canvas;
    }

    /** @returns {GPUCanvasContext | undefined} */
    static get Context()
    {
        return UWAL.#Context;
    }

    static get AspectRatio()
    {
        !UWAL.#Canvas && ThrowError(ERROR.CANVAS_NOT_FOUND);
        return UWAL.#Canvas.width / UWAL.#Canvas.height;
    }

    static get CurrentTexture()
    {
        return UWAL.#Context.getCurrentTexture();
    }

    static get CurrentTextureView()
    {
        return UWAL.CurrentTexture.createView();
    }

    static get VERSION()
    {
        return VERSION;
    }
}

console.info(`%cUWAL v${UWAL.VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
