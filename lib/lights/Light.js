import { utils } from "wgpu-matrix";

export default class Light
{
    /** @type {number} */ #Intensity = 1;
    /** @type {string | undefined} */ Label;

    /** @param {string} [label = "Light"] */
    constructor(label = "Light")
    {
        this.Label = label;
    }

    /** @param {number} intensity */
    set Intensity(intensity)
    {
        this.#Intensity = Math.max(intensity, utils.EPSILON);
    }

    get Intensity()
    {
        return this.#Intensity;
    }
}
