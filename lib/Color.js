export default class Color
{
    #Red   = 1;
    #Green = 1;
    #Blue  = 1;
    #Alpha = 1;

    /** @param {number} [value = 0xffffffff] */
    constructor(value = 0xffffffff)
    {
        this.Value = value;
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

    /** @param {number[]} values */
    set RGBA(values)
    {
        this.RGB = values;
    }

    get RGBA()
    {
        return this.RGB.concat(this.#Alpha * 255);
    }

    /** @param {number} value */
    set Value(value)
    {
        if (value > 0xffffff)
            this.#Alpha = (value & 255) / 255;

        else
        {
            value = (value << 8) | (value >>> 24);
            value >>>= 0; this.#Alpha = 1;
        }

        this.#Red   = (value >> 24 & 255) / 255;
		this.#Green = (value >> 16 & 255) / 255;
		this.#Blue  = (value >>  8 & 255) / 255;
    }
}
