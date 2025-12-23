import Light from "./Light";
import { vec3, utils } from "wgpu-matrix";

export default class PointLight extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3} Vec3 */
    /** @type {Vec3} */ #Position = vec3.create();
    /** @type {number} */ #Intensity = 1;

    /**
     * @param {Vec3} [position]
     * @param {string} [label = "PointLight"]
     */
    constructor(position, label = "PointLight")
    {
        super(label);
        this.Position = position || this.#Position;
    }

    /** @param {Vec3} position */
    set Position(position)
    {
        vec3.copy(position, this.#Position);
    }

    get Position()
    {
        return this.#Position;
    }

    /** @param {number} intensity*/
    set Intensity(intensity)
    {
        this.#Intensity = Math.max(intensity, utils.EPSILON);
    }

    get Intensity()
    {
        return this.#Intensity;
    }
}
