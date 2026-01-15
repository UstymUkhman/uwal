import Light from "./Light";
import { vec3 } from "wgpu-matrix";

export default class PointLight extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3} Vec3 */
    /** @type {Vec3} */ #Position = vec3.create();

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
}
