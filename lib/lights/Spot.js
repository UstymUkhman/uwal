import Point from "./Point";
import { vec2, vec3, mat4 } from "wgpu-matrix";

export default class Spot extends Point
{
    /** @import {Vec2, Vec3, Mat4} from "wgpu-matrix" */

    /** @type {Vec3} */ #Direction = vec3.create();
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {Vec2} */ #Limit = vec2.create();
    /** @type {Mat4} */ #Aim = mat4.create();

    /**
     * @param {Vec3} [position = [0, 0, 0]]
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]]
     * @param {string} [label = "Spot"]
     */
    constructor(position, color, label = "Spot")
    {
        super(position, color, label);
    }

    #UpdateDirectionBuffer()
    {
        this.Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Direction),
            32, 0, 3
        );
    }

    #UpdateLimitBuffer()
    {
        this.Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Limit),
            48, 0, 2
        );
    }

    /** @param {Vec3} target */
    LookAt(target)
    {
        // Get the Z axis from the target matrix and negate it.
        mat4.aim(this.Position, target, this.#Up, this.#Aim);
        vec3.copy(this.#Aim.slice(8, 11), this.#Direction);
        this.#UpdateDirectionBuffer();
        return this.#Direction;
    }

    /**
     * @override
     * @param {RenderPipeline} Pipeline
     * @param {string} [uniformName = "DirectionalLight"]
     */
    SetRenderPipeline(Pipeline, uniformName = "SpotLight")
    {
        const buffer = super.SetRenderPipeline(Pipeline, uniformName);
        this.#UpdateDirectionBuffer();
        this.#UpdateLimitBuffer();
        return buffer;
    }

    /** @param {Vec2} limit */
    set Limit(limit)
    {
        this.#Limit.set(limit.toSorted().map(Math.cos));
        this.#UpdateLimitBuffer();
    }

    get Limit()
    {
        return this.#Limit;
    }
}
