import Light from "#/lights/Light";
import { vec3 } from "wgpu-matrix";

export default class Directional extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3} Vec3 */
    /** @type {Vec3} */ #Direction = vec3.create(0, 0, -1);

    /**
     * @param {Vec3} [direction = [0, 0, -1]]
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]]
     * @param {string} [label = "Directional"]
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
     * @param {RenderPipeline} Pipeline
     * @param {string} [uniformName = "DirectionalLight"]
     */
    SetRenderPipeline(Pipeline, uniformName = "DirectionalLight")
    {
        const buffer = super.SetRenderPipeline(Pipeline, uniformName);
        this.#UpdateDirectionBuffer();
        return buffer;
    }

    /** @param {Vec3} direction */
    set Direction(direction)
    {
        vec3.normalize(direction, this.#Direction);
        this.#UpdateDirectionBuffer();
    }

    get Direction()
    {
        return this.#Direction;
    }
}
