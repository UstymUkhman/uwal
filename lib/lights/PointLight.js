import { Light } from "./Light";
import { vec3 } from "wgpu-matrix";

/**
 * A light used to radiate from one point in all directions.
 * @see [Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.
 *
 * @noInheritDoc
 */
export class PointLight extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3} Vec3 */
    /** @type {Vec3} */ #Position = vec3.create();

    /**
     * @param {Vec3} [position = [0, 0, 0]] - Light position.
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]] - Light color. Defaults to white.
     * @param {string} [label = "Point"] - Light name.
     */
    constructor(position, color, label = "Point")
    {
        super(color, label);

        this.Position = position || this.#Position;
    }

    #UpdatePositionBuffer()
    {
        this.Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.LightBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#Position),
            16, 0, 3
        );
    }

    /**
     * @override
     * Create and update an internal uniform buffer of this light's color, intensity, and position values.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this light.
     * @param {string} [uniformName = "PointLight"] - Uniform buffer name.
     */
    SetRenderPipeline(Pipeline, uniformName = "PointLight")
    {
        const buffer = super.SetRenderPipeline(Pipeline, uniformName);
        this.#UpdatePositionBuffer();
        return buffer;
    }

    /**
     * @param {Vec3} position - Light position.
     */
    set Position(position)
    {
        vec3.copy(position, this.#Position);
        this.#UpdatePositionBuffer();
    }

    /**
     * @returns The position of the light.
     */
    get Position()
    {
        return this.#Position;
    }
}
