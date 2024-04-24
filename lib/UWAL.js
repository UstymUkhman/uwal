/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.0
 * @license MIT
 */

import { Render, Compute } from "@/pipeline";
import { ERROR, EVENT } from "@/Constants";
import { throwError } from "@/Errors";

export default class UWAL
{
    /** @type {GPUTextureFormat} */ static #PreferredCanvasFormat;

    /** @type {GPUAdapter | null} */ static #Adapter = null;
    /** @type {GPUDevice | null} */ static #Device = null;

    /** @type {HTMLCanvasElement} */ static #Canvas;
    /** @type {GPUCanvasContext} */ static #Context;

    /** @type {GPURequestAdapterOptions} */ static #AdapterOptions =
    {
        powerPreference: undefined, forceFallbackAdapter: false
    }

    /** @type {GPUDeviceDescriptor} */ static #DeviceDescriptor =
    {
        label: "", requiredFeatures: [], requiredLimits: {}
    }

    /** @type {((detail: GPUDeviceLostInfo) => unknown) | undefined} */ static OnDeviceLost;

    /**
     * @param {GPUPowerPreference} [powerPreference = undefined]
     * @param {boolean} [forceFallbackAdapter = false]
     */
    static SetAdapterOptions(powerPreference = undefined, forceFallbackAdapter = false)
    {
        UWAL.#AdapterOptions.powerPreference = powerPreference;
        UWAL.#AdapterOptions.forceFallbackAdapter = forceFallbackAdapter;
    }

    /**
     * @param {string} [label = ""]
     * @param {Iterable<GPUFeatureName>} [requiredFeatures = []]
     * @param {Record<string, GPUSize64>} [requiredLimits = {}]
     */
    static SetDeviceDescriptor(label = "", requiredFeatures = [], requiredLimits = {})
    {
        UWAL.#DeviceDescriptor.label = label;
        UWAL.#DeviceDescriptor.requiredFeatures = requiredFeatures;
        UWAL.#DeviceDescriptor.requiredLimits = requiredLimits;
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

            if (!context) throwError(ERROR.CONTEXT_NOT_SUPPORTED);

            const preferredFormat = options.format ?? UWAL.#PreferredCanvasFormat;
            const configuration = { ...options, format: preferredFormat };

            context.configure({ device, ...configuration });

            UWAL.#Canvas = canvas;
            UWAL.#Context = context;

            return new Proxy(Render,
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

            return new Proxy(Compute,
            {
                construct(Pipeline)
                {
                    return new Pipeline(device, commandEncoderLabel);
                }
            });
        })();
    }

    static #RequestAdapter()
    {
        if (!navigator.gpu) throwError(ERROR.WEBGPU_NOT_SUPPORTED);

        UWAL.#PreferredCanvasFormat = navigator.gpu.getPreferredCanvasFormat();

        return async () =>
        {
            const adapter = await navigator.gpu.requestAdapter(UWAL.#AdapterOptions);
            if (!adapter) throwError(ERROR.ADAPTER_NOT_FOUND);
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

            if (!device) throwError(ERROR.DEVICE_NOT_FOUND);
            device.lost.then(UWAL.#DeviceLost);
            return UWAL.#Device = device;
        };
    }

    /** @param {GPUDeviceLostInfo} detail */
    static #DeviceLost(detail)
    {
        if (UWAL.OnDeviceLost) return UWAL.OnDeviceLost?.(detail);

        UWAL.#Canvas.dispatchEvent(new CustomEvent(EVENT.DEVICE_LOST, { detail }));

        const message = (detail.message && ` | Message: ${detail.message}`) ?? '.';

        // If device is destroyed intentionally, `reason` will be `destroyed`.
        throwError(ERROR.DEVICE_LOST, ` Reason: ${detail.reason}` + message);
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
