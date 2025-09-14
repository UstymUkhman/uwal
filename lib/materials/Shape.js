import { GetColorArray } from "#/utils";
import Color from "#/Color";

export default class Shape
{
    /** @type {Float32Array} */ #Color;
    /** @type {number[] | undefined} */ #ColorValue;
    /** @type {GPUBuffer | undefined} */ #ColorBuffer;

    /** @param {import("../Color").ColorParam | number} [color = 0xffffff] */
    constructor(color = 0xffffff)
    {
        this.Color = color;
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [label = "Shape"]
     */
    CreateColorBuffer(Pipeline, label = "Shape")
    {
        const { color, buffer } = Pipeline.CreateUniformBuffer("color", { label: `${label} Color Buffer` });

        this.#Color = color;
        this.#ColorBuffer = buffer;
        this.#Color.set(this.#ColorValue);
        Pipeline.WriteBuffer(buffer, color);
    }

    /** @param {import("../Color").ColorParam | number} color */
    set Color(color)
    {
        this.#ColorValue = typeof color === "number" && GetColorArray(color) ||
            color instanceof Color && color.rgba || Object.values(color);

        this.#Color?.set(this.#ColorValue);
    }

    get Color()
    {
        return this.#ColorValue;
    }

    get ColorBuffer()
    {
        return this.#ColorBuffer;
    }
}
