import { Color, GetColorArray } from "#/utils";

export default class Mesh
{
    /** @type {string} */ #Label;
    /** @type {Float32Array} */ #Color;
    /** @type {RenderPipeline} */ #Pipeline;
    /** @type {number[] | undefined} */ #ColorValue;
    /** @type {GPUBuffer | undefined} */ #ColorBuffer;

    /**
     * @param {import("../utils/Color").ColorParam | number} [color = 0xffffff]
     * @param {string} [label = "Mesh"]
     */
    constructor(color = 0xffffff, label = "Mesh")
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

        this.#Color = color;
        this.#Pipeline = Pipeline;
        this.#ColorBuffer = buffer;

        this.#Color.set(this.#ColorValue);
        Pipeline.WriteBuffer(buffer, color);
    }

    get ColorBuffer()
    {
        return this.#ColorBuffer;
    }

    /** @param {import("../utils/Color").ColorParam | number} color */
    set Color(color)
    {
        this.#ColorValue = typeof color === "number" && GetColorArray(color) ||
            color instanceof Color && color.rgba || Object.values(color);

        this.#Color?.fill(1).set(this.#ColorValue);
        this.#Pipeline?.WriteBuffer(this.#ColorBuffer, this.#Color);
    }

    get Color()
    {
        return this.#ColorValue;
    }

    Destroy()
    {
        this.#Pipeline = undefined;
        this.#ColorBuffer.destroy();
        this.#ColorBuffer = undefined;
    }
}
