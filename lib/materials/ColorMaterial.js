import { Color, GetColorArray, GetGPUColorValue } from "#/utils";

export default class ColorMaterial
{
    /** @type {string} */ #Label;
    /** @type {number[]} */ #ColorValue = [];
    /** @type {boolean} */ Transparent = false;

    /** @type {Float32Array | undefined} */ #Color;
    /** @type {string} */ #ID = crypto.randomUUID();
    /** @type {GPUBuffer | undefined} */ #ColorBuffer;

    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {Color} */ #BlendConstant = new Color(0, 0);

    /** @typedef {import("../utils/Color").ColorParam} ColorParam */

    /**
     * @param {ColorParam | number} [color = 0x000000]
     * @param {string} [label = "ColorMaterial"]
     */
    constructor(color = 0x000000, label = "ColorMaterial")
    {
        this.Color  = color;
        this.#Label = label;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = this.#Label]
     */
    CreateColorBuffer(Pipeline, label = this.#Label)
    {
        const { color, buffer } = Pipeline.CreateUniformBuffer(
            "color", { label: `${label} Color Buffer` }
        );

        this.#Pipeline = Pipeline; this.#ColorBuffer = buffer;

        (this.#Color = /** @type {Float32Array} */ (color)).set(this.#ColorValue);
        Pipeline.WriteBuffer(buffer, /** @type {GPUAllowSharedBufferSource} */ (color));
    }

    /** @param {RenderPipeline} [Pipeline] */
    SetBlendConstant(Pipeline)
    {
        if (!Pipeline?.BlendConstant || !this.#BlendConstant.Equals(Pipeline.BlendConstant))
            return !!(/** @type {RenderPipeline} */ (this.#Pipeline).BlendConstant = this.#BlendConstant);

        return false;
    }

    /** @param {ColorParam | number} color */
    set BlendConstant(color)
    {
        typeof color === "number" && this.#BlendConstant.Set(color) ||
            (this.#BlendConstant.rgba = GetGPUColorValue(/** @type {ColorParam} */ (color)));
    }

    get BlendConstant()
    {
        return this.#BlendConstant;
    }

    get ColorBuffer()
    {
        return this.#ColorBuffer;
    }

    /** @param {ColorParam | number} color */
    set Color(color)
    {
        this.#ColorValue = typeof color === "number" && GetColorArray(color) ||
            GetGPUColorValue(/** @type {ColorParam} */ (color));

        this.#Color?.fill(1).set(this.#ColorValue);

        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#ColorBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Color)
        );
    }

    get Color()
    {
        return this.#ColorValue;
    }

    get ID()
    {
        return this.#ID;
    }

    Destroy()
    {
        this.#Pipeline = undefined;
        this.#ColorBuffer?.destroy();
        this.#ColorBuffer = undefined;
    }
}
