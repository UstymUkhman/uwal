import { vec3 } from "wgpu-matrix";
import { MathUtils, GetGPUColorValue } from "#/utils";

/** @abstract */ export default class Light
{
    /** @type {string | undefined} */ Label;
    /** @type {GPUBuffer | undefined} */ #LightBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;

    /** @typedef {import("../utils/Color").ColorParam} Color */
    /** @type {import("wgpu-matrix").Vec3} */ #Color = vec3.create(1, 1, 1);
    /** @type {Float32Array<ArrayBufferLike>} */ #Intensity = Float32Array.of(1);

    /**
     * @param {Color} [color = [1, 1, 1]]
     * @param {string} [label = "Light"]
     */
    constructor(color, label = "Light")
    {
        this.Color = color || /** @type {Color} */ (/** @type {unknown} */ (this.#Color));
        this.Label = label;
    }

    /**
     * @protected
     * @param {RenderPipeline} Pipeline
     * @param {string} uniformName
     */
    SetRenderPipeline(Pipeline, uniformName)
    {
        this.#LightBuffer = (this.#Pipeline = Pipeline).CreateUniformBuffer(
            uniformName, { label: `${this.Label} Light Buffer` }
        ).buffer;

        this.#UpdateIntensityBuffer();
        this.#UpdateColorBuffer();

        return this.#LightBuffer;
    }

    #UpdateIntensityBuffer()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Intensity),
            12, 0, 1
        );
    }

    #UpdateColorBuffer()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Color)
        );
    }

    Destroy()
    {
        this.#Pipeline = this.#LightBuffer?.destroy();
    }

    get Pipeline()
    {
        return this.#Pipeline;
    }

    get LightBuffer()
    {
        return this.#LightBuffer;
    }

    /** @param {number} intensity */
    set Intensity(intensity)
    {
        this.#Intensity[0] = Math.max(intensity, MathUtils.EPSILON);
        this.#UpdateIntensityBuffer();
    }

    get Intensity()
    {
        return this.#Intensity[0];
    }

    /** @param {Color} color */
    set Color(color)
    {
        this.#Color.set(GetGPUColorValue(color).slice(0, 3));
        this.#UpdateColorBuffer();
    }

    /** @returns {Float32Array<ArrayBufferLike>} */
    get Color()
    {
        return this.#Color;
    }
}
