import { Light } from "./Light";

/**
 * A light used to equally illuminate all meshes in the scene.
 * There should be only one source; it cannot cast shadows and does not have a direction.
 * @see [Primitives / Lights](https://ustymukhman.github.io/uwal/dist/examples/examples.html#primitives-lights) for reference.
 *
 * @noInheritDoc
 */
export class AmbientLight extends Light
{
    /**
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]] - Light color. Defaults to white.
     * @param {string} [label = "AmbientLight"] - Light label.
     */
    constructor(color, label = "AmbientLight")
    {
        super(color, label);
    }

    /**
     * @override
     * Create and update an internal uniform buffer of this light's color and intensity values.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this light.
     * @param {string} [uniformName = "AmbientLight"] - Uniform buffer name.
     */
    SetRenderPipeline(Pipeline, uniformName = "AmbientLight")
    {
        return super.SetRenderPipeline(Pipeline, uniformName);
    }
}
