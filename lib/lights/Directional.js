/** @module DirectionalLight */

import { Light } from "./Light";
import { vec3 } from "wgpu-matrix";

/**
 * A light used to radiate in a specific direction. It is positioned infinitely far away, and its rays are parallel.
 * @see [Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.
 *
 * @noInheritDoc
 */
export class Directional extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3} Vec3 */
    /** @type {Vec3} */ #Direction = vec3.create(0, -1, 0);

    /**
     * @param {Vec3} [direction = [0, -1, 0]] - Light direction. Defaults to `[0, -1, 0]`.
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]] - Light color. Defaults to white.
     * @param {string} [label = "Directional"] - Light name.
     */
    constructor(direction, color, label = "Directional")
    {
        super(color, label);

        this.Direction = direction || this.#Direction;
    }

    #UpdateDirectionBuffer()
    {
        this.Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Direction),
            16, 0, 3
        );
    }

    /**
     * @override
     * Create and update an internal uniform buffer of this light's color and intensity values.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this light.
     * @param {string} [uniformName = "DirectionalLight"] - Uniform buffer name.
     */
    SetRenderPipeline(Pipeline, uniformName = "DirectionalLight")
    {
        const buffer = super.SetRenderPipeline(Pipeline, uniformName);
        this.#UpdateDirectionBuffer();
        return buffer;
    }

    /**
     * Compute the light direction from angles in radians.
     *
     * @param {number} pitch - Light elevation.
     * @param {number} yaw - Compass direction.
     */
    SetDirectionFrom(pitch, yaw)
    {
        vec3.set(
            Math.cos(pitch) * Math.sin(yaw),
            Math.sin(pitch),
            Math.cos(pitch) * Math.cos(yaw),
            this.#Direction
        );
    }

    /**
     * Set the light direction to point at the specified point in 3D space.
     *
     * @param {Vec3} target - Point in 3D space to look at.
     * @param {Vec3} position - Approximate light position.
     */
    LookAt(target, position)
    {
        vec3.sub(target, position, this.#Direction);
        vec3.normalize(this.#Direction, this.#Direction);
    }

    /**
     * @param {Vec3} direction - Light direction.
     */
    set Direction(direction)
    {
        vec3.normalize(direction, this.#Direction);
        this.#UpdateDirectionBuffer();
    }

    /**
     * @returns The direction of the light.
     */
    get Direction()
    {
        return this.#Direction;
    }
}
