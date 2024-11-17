/**
 * @typedef {Color | GPUColor} ColorParam
 * @exports ColorParam
 */

export default class Color
{
    #Red   = 0;
    #Green = 0;
    #Blue  = 0;
    #Alpha = 1;

    /**
     * @param {number} [hexOrRed = 0x000000]
     * @param {number} [green]
     * @param {number} [blue]
     * @param {number} [alpha = 0xff]
     */
    constructor(hexOrRed = 0x000000, green, blue, alpha = 0xff)
    {
        if (typeof green === "number" && typeof blue === "number")
            this.RGBA = [hexOrRed, green, blue, alpha];

        else
        {
            this.#Red   = (hexOrRed >> 16 & 0xff) / 255;
            this.#Green = (hexOrRed >>  8 & 0xff) / 255;
            this.#Blue  = (hexOrRed       & 0xff) / 255;
            this.#Alpha =                   alpha / 255;
        }
    }

    /**
     * @param {number} [alpha]
     * @param {Color} [dst]
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

    /** @param {number[]} values */
    set rgb(values)
    {
        this.#Red   = values[0]     ;
        this.#Green = values[1]     ;
        this.#Blue  = values[2]     ;
        this.#Alpha = values[3] ?? 1;
    }

    get rgb()
    {
        return [this.#Red, this.#Green, this.#Blue];
    }

    /** @param {number} value */
    set a(value)
    {
        this.#Alpha = value;
    }

    get a()
    {
        return this.#Alpha;
    }

    /** @param {number[]} values */
    set rgba(values)
    {
        this.rgb = values;
    }

    get rgba()
    {
        return this.rgb.concat(this.#Alpha);
    }

    /** @param {number[]} values */
    set RGB(values)
    {
        this.#Red   =  values[0]         / 255;
        this.#Green =  values[1]         / 255;
        this.#Blue  =  values[2]         / 255;
        this.#Alpha = (values[3] ?? 255) / 255;
    }

    get RGB()
    {
        return [this.#Red * 255, this.#Green * 255, this.#Blue * 255];
    }

    /** @param {number} value */
    set A(value)
    {
        this.#Alpha = value / 255;
    }

    get A()
    {
        return this.#Alpha * 255;
    }

    /** @param {number[]} values */
    set RGBA(values)
    {
        this.RGB = values;
    }

    get RGBA()
    {
        return this.RGB.concat(this.A);
    }
}
