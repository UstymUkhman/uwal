import Light from "./Light";
import { vec3 } from "wgpu-matrix";

export default class DirectionalLight extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */
    /** @type {Vec3} */ #Direction = vec3.create(0, 0, -1);

    /**
     * @param {Vec3} [direction]
     * @param {string} [label = "DirectionalLight"]
     */
    constructor(direction, label = "DirectionalLight")
    {
        super(label);
        this.Direction = direction || vec3.create(0, 0, -1);
    }

    /** @param {Vec3} direction */
    set Direction(direction)
    {
        vec3.normalize(direction, this.#Direction);
    }

    get Direction()
    {
        return this.#Direction;
    }
}
