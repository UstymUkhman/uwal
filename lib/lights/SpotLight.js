import { PointLight } from "./PointLight";
import { vec2, vec3, mat4 } from "wgpu-matrix";

/**
 * A light used to radiate from one point in one direction, along a cone increasing in size further away from the light.
 * @see [Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.
 *
 * @noInheritDoc
 */
export class SpotLight extends PointLight
{
    /** @import {Vec2, Vec3, Mat4} from "wgpu-matrix" */

    /** @type {Vec3} */ #Direction = vec3.create();
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {Vec2} */ #Limit = vec2.create();
    /** @type {Mat4} */ #Aim = mat4.create();

    /**
     * @param {Vec3} [position = [0, 0, 0]] - Light position.
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]] - Light color. Defaults to white.
     * @param {string} [label = "SpotLight"] - Light label.
     */
    constructor(position, color, label = "SpotLight")
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

    /**
     * Set the light to point at the specified point in 3D space.
     *
     * @param {Vec3} target - Point in 3D space to look at.
     */
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
     * Create and update an internal uniform buffer of this light's color, intensity, position, direction and limit values.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this light.
     * @param {string} [uniformName = "SpotLight"] - Uniform buffer name.
     */
    SetRenderPipeline(Pipeline, uniformName = "SpotLight")
    {
        const buffer = super.SetRenderPipeline(Pipeline, uniformName);
        this.#UpdateDirectionBuffer();
        this.#UpdateLimitBuffer();
        return buffer;
    }

    /**
     * @param {Vec2} limit - Light limits.
     */
    set Limit(limit)
    {
        this.#Limit.set(limit.toSorted().map(Math.cos));
        this.#UpdateLimitBuffer();
    }

    /**
     * @returns Inner and outer limit of the light. Everything inside the inner limit is fully illuminated, while objects
     * outside the outer limit receive no light. Light intensity between these limits is lerped using a `smoothstep` function.
     */
    get Limit()
    {
        return this.#Limit;
    }
}
