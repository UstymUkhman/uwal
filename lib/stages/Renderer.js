import { BaseStage } from "#/stages";
import { RenderPipeline } from "#/pipelines";
import { ERROR, ThrowWarning } from "#/Errors";

export default class Renderer extends BaseStage
{
    /** @type {GPURenderPassDescriptor} */ #Descriptor;
    /** @type {GPURenderPassEncoder | undefined} */ #CurrentPass;

    /** @typedef {import("../pipelines/RenderPipeline").RenderPipelineDescriptor} RenderPipelineDescriptor */

    /**
     * @param {GPUDevice} device
     * @param {string} [programName = ""]
     * @param {HTMLCanvasElement} [canvas]
     * @param {ConfigurationOptions} [options = {}]
     */
    constructor(device, programName, canvas, options)
    {
        super(device, programName);
    }

    /**
     * @param {RenderPipelineDescriptor | GPUShaderModule} [moduleDescriptor]
     * @param {boolean} [useInCurrentPass]
     */
    async CreatePipeline(moduleDescriptor, useInCurrentPass)
    {
        const Pipeline = new RenderPipeline(this.Device, this.ProgramName);
        const pipeline = await Pipeline.Init(moduleDescriptor);

        if (useInCurrentPass) this.#CurrentPass
            ? this.#CurrentPass.setPipeline(pipeline)
            : ThrowWarning(ERROR.RENDER_PASS_NOT_FOUND);

        // Prevent resetting an already stored pipeline:
        Reflect.deleteProperty(Pipeline, "Init");

        this.Pipelines.push(Pipeline);
        return Pipeline;
    }
}
