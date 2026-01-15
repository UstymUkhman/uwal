import Light from "./Light";
import { vec2, vec3, mat4 } from "wgpu-matrix";

export default class SpotLight extends Light
{
    /** @import {Vec2, Vec3, Mat4} from "wgpu-matrix" */

    /** @type {Vec3} */ #Direction = vec3.create();
    /** @type {Vec3} */ #Position = vec3.create();
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {Vec2} */ #Limit = vec2.create();
    /** @type {Mat4} */ #Aim = mat4.create();

    /**
     * @param {Vec3} [position]
     * @param {string} [label = "SpotLight"]
     */
    constructor(position, label = "SpotLight")
    {
        super(label);
        this.Position = position || this.#Position;
    }

    /** @param {Vec3} target */
    LookAt(target)
    {
        // Get the Z axis from the target matrix and negate it:
        mat4.aim(this.#Position, target, this.#Up, this.#Aim);
        return vec3.copy(this.#Aim.slice(8, 11), this.#Direction);
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

    /** @param {Vec2} limit */
    set Limit(limit)
    {
        this.#Limit.set(limit.toSorted().map(Math.cos));
    }

    get Limit()
    {
        return this.#Limit;
    }
}
