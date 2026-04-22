import Light from "#/lights/Light";

export default class Ambient extends Light
{
    /**
     * @param {import("../utils/Color").ColorParam} [color = [1, 1, 1]]
     * @param {string} [label = "Ambient"]
     */
    constructor(color, label = "Ambient")
    {
        super(color, label);
    }

    /**
     * @override
     * @param {RenderPipeline} Pipeline
     * @param {string} [uniformName = "AmbientLight"]
     */
    SetRenderPipeline(Pipeline, uniformName = "AmbientLight")
    {
        return super.SetRenderPipeline(Pipeline, uniformName);
    }
}
