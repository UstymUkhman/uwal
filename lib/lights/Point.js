import Light from "./Light";
import { vec3 } from "wgpu-matrix";

export default class Point extends Light
{
    /** @typedef {import("wgpu-matrix").Vec3} Vec3 */
    /** @type {Vec3} */ #Position = vec3.create();

    /**
     * @param {Vec3} [position = [0, 0, 0]]
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]]
     * @param {string} [label = "Point"]
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
     * @param {RenderPipeline} Pipeline
     * @param {string} [uniformName = "DirectionalLight"]
     */
    SetRenderPipeline(Pipeline, uniformName = "PointLight")
    {
        const buffer = super.SetRenderPipeline(Pipeline, uniformName);
        this.#UpdatePositionBuffer();
        return buffer;
    }

    /** @param {Vec3} position */
    set Position(position)
    {
        vec3.copy(position, this.#Position);
        this.#UpdatePositionBuffer();
    }

    get Position()
    {
        return this.#Position;
    }
}
