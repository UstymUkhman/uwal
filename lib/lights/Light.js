/** @module Light */

import { vec3 } from "wgpu-matrix";
import { EPSILON } from "#/utils/Math";
import { GetGPUColorValue } from "#/utils";

/**
 * Base class for [ambient](./AmbientLight), [directional](./DirectionalLight),
 * [point](./PointLight), and [spot](./SpotLight) lights.
 *
 * @abstract
 * @noInheritDoc
 */
export class Light
{
    /**
     * Light name.
     *
     * @type {string}
     */
    Label;

    /** @type {GPUBuffer | undefined} */ #LightBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;

    /** @typedef {import("../utils/Color").ColorParam} ColorParam */
    /** @type {import("wgpu-matrix").Vec3} */ #Color = vec3.create(1, 1, 1);
    /** @type {Float32Array<ArrayBufferLike>} */ #Intensity = Float32Array.of(1);

    /**
     * @param {ColorParam} [color = [1, 1, 1]] - Light color. Defaults to white.
     * @param {string} [label = "Light"] - Light name.
     */
    constructor(color, label = "Light")
    {
        this.Color = color || /** @type {ColorParam} */ (/** @type {unknown} */ (this.#Color));
        this.Label = label;
    }

    #UpdateColorBuffer()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Color)
        );
    }

    #UpdateIntensityBuffer()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Intensity),
            12, 0, 1
        );
    }

    /**
     * @protected
     * Create and update an internal uniform buffer of this light's color and intensity values.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this light.
     * @param {string} uniformName - Uniform buffer name.
     */
    SetRenderPipeline(Pipeline, uniformName)
    {
        this.#LightBuffer = (this.#Pipeline = Pipeline).CreateUniformBuffer(
            uniformName, { label: `${this.Label} Light Buffer` }
        ).buffer;

        this.#UpdateColorBuffer();
        this.#UpdateIntensityBuffer();

        return this.#LightBuffer;
    }

    /**
     * Destroy the internal uniform buffer.
     */
    Destroy()
    {
        this.#Pipeline = this.#LightBuffer?.destroy();
    }

    /**
     * @param {ColorParam} color - Light color.
     */
    set Color(color)
    {
        this.#Color.set(GetGPUColorValue(color).slice(0, 3));
        this.#UpdateColorBuffer();
    }

    /**
     * @returns {Float32Array<ArrayBufferLike>} The color of the light.
     */
    get Color()
    {
        return this.#Color;
    }

    /**
     * @param {number} intensity - Light intensity.
     */
    set Intensity(intensity)
    {
        this.#Intensity[0] = Math.max(intensity, EPSILON);
        this.#UpdateIntensityBuffer();
    }

    /**
     * @returns The intensity of the light.
     */
    get Intensity()
    {
        return this.#Intensity[0];
    }

    /**
     * @hidden
     * @protected
     */
    get Pipeline()
    {
        return this.#Pipeline;
    }

    /**
     * @hidden
     * @protected
     */
    get LightBuffer()
    {
        return this.#LightBuffer;
    }
}
