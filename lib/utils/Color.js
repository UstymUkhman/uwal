/** @module Color */

import { Random } from './Math';
import { GetColorArray, GetGPUColorValue } from "#/utils";

/**
 * @typedef {Color | GPUColor} ColorParam
 * @exports ColorParam
 */

/**
 * Utility class to convert, adjust, and compare color values.
 */
export class Color
{
    #Red   = 0;
    #Green = 0;
    #Blue  = 0;
    #Alpha = 1;

    /**
     * Create a new color from a single hex value or using 3 or 4 channel components.
     *
     * @param {number} [hexOrRed = 0x000000] - RGB hex or red channel in `0 - 255` format.
     * @param {number} [green] - Green channel in `0 - 255` format.
     * @param {number} [blue] - Blue channel in `0 - 255` format.
     * @param {number} [alpha = 1] - Alpha value in `0 - 1` format.
     */
    constructor(hexOrRed = 0x000000, green, blue, alpha = 1)
    {
        if (typeof green === "number" && typeof blue === "number")
            this.RGBA = [hexOrRed, green, blue, alpha * 255];

        else
            this.Set(hexOrRed, alpha);
    }

    /**
     * Update this color to a new value.
     *
     * @param {number} hex - Hex value.
     * @param {number} [alpha = 1] - Alpha value.
     */
    Set(hex, alpha = 1)
    {
        const color = GetColorArray(hex, alpha * 255);

        this.#Red   = color[0];
        this.#Green = color[1];
        this.#Blue  = color[2];
        this.#Alpha = color[3];

        return this;
    }

    /**
     * Multiply this color with an alpha value.
     *
     * @param {number} [alpha = this.#Alpha] - Alpha value to multiply in `0 - 1` format. Defaults to the color's alpha.
     * @param {Color} [dst = new Color()] - Destination color. A new one is created if omitted.
     */
    Premultiply(alpha, dst)
    {
        dst ??= new Color();
        alpha ??= this.#Alpha;

        const red   = this.#Red   * alpha;
        const green = this.#Green * alpha;
        const blue  = this.#Blue  * alpha;

        dst.rgba = [red, green, blue, alpha];

        return dst;
    }

    /**
     * Set this color to a random value.
     *
     * @param {number} [alpha = 1] - Alpha value. Call with `undefined` to randomize it.
     */
    Random(alpha = 1)
    {
        this.rgb = [ Random(),
                     Random(),
                     Random(),
            alpha ?? Random()
        ];

        return this;
    }

    /**
     * Compare this color value with the provided one.
     *
     * @param {ColorParam | number} color - Color to compare.
     */
    Equals(color)
    {
        const [r, g, b, a = 1] = typeof color === "number" && /*@__INLINE__*/ GetColorArray(color) ||
            /*@__INLINE__*/ GetGPUColorValue(/** @type {ColorParam} */ (color));

        return this.#Red === r && this.#Green === g && this.#Blue === b && this.#Alpha === a;
    }

    /**
     * Set this color components using `0 - 255` format. Alpha defaults to `255` if omitted.
     *
     * @param {number[]} values - 3 or 4 color channels.
     */
    set RGB(values)
    {
        this.#Red   =  values[0]         / 255;
        this.#Green =  values[1]         / 255;
        this.#Blue  =  values[2]         / 255;
        this.#Alpha = (values[3] ?? 255) / 255;
    }

    /**
     * @returns This color components in `0 - 255` format. Alpha is omitted.
     */
    get RGB()
    {
        return [this.#Red * 255, this.#Green * 255, this.#Blue * 255];
    }

    /**
     * Set this color components using `0 - 255` format.
     * @alias [Color.RGB](#rgb-1)
     *
     * @param {number[]} values - 3 or 4 color channels.
     */
    set RGBA(values)
    {
        this.RGB = values;
    }

    /**
     * @returns This color components in `0 - 255` format.
     */
    get RGBA()
    {
        return this.RGB.concat(this.A);
    }

    /**
     * Set this color alpha in `0 - 255` format.
     *
     * @param {number} value - Alpha value.
     */
    set A(value)
    {
        this.#Alpha = value / 255;
    }

    /**
     * @returns This color alpha in `0 - 255` format.
     */
    get A()
    {
        return this.#Alpha * 255;
    }

    /**
     * Set this color components using `0 - 1` format. Alpha defaults to `1` if omitted.
     *
     * @param {number[]} values - 3 or 4 color channels.
     */
    set rgb(values)
    {
        this.#Red   = values[0]     ;
        this.#Green = values[1]     ;
        this.#Blue  = values[2]     ;
        this.#Alpha = values[3] ?? 1;
    }

    /**
     * @returns This color components in `0 - 1` format. Alpha is omitted.
     */
    get rgb()
    {
        return [this.#Red, this.#Green, this.#Blue];
    }

    /**
     * Set this color components using `0 - 1` format.
     * @alias [Color.rgb](#rgb)
     *
     * @param {number[]} values - 3 or 4 color channels.
     */
    set rgba(values)
    {
        this.rgb = values;
    }

    /**
     * @returns This color components in `0 - 1` format.
     */
    get rgba()
    {
        return this.rgb.concat(this.#Alpha);
    }

    /**
     * Set this color alpha in `0 - 1` format.
     *
     * @param {number} value - Alpha value.
     */
    set a(value)
    {
        this.#Alpha = value;
    }

    /**
     * @returns This color alpha in `0 - 1` format.
     */
    get a()
    {
        return this.#Alpha;
    }
}
