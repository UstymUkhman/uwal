import { Device } from "#/Device";
import RenderStage from "./RenderStage";
import ComputeStage from "./ComputeStage";

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} [name = ""]
 * @param {import("../Device").ConfigurationOptions} [options = {}]
 */
export function Renderer(canvas, name = "", options = {})
{
    Device.DescriptorLabel = name;

    options.format ??= Device.PreferredCanvasFormat;

    return /** @type {Promise<RenderStage & { new(): RenderStage }>} */ ((async () =>
    {
        const device = await Device.GPUDevice;

        return device && new Proxy(RenderStage,
        {
            construct(Stage)
            {
                return new Stage(device, canvas, /** @type {import("../Device").CanvasConfiguration} */ (options), name);
            }
        });
    })());
}

/** @param {string} [name = ""] */
export function Computation(name)
{
    Device.DescriptorLabel = name;

    return /** @type {Promise<ComputeStage & { new(): ComputeStage }>} */ ((async () =>
    {
        const device = await Device.GPUDevice;

        return device && new Proxy(ComputeStage,
        {
            construct(Stage)
            {
                return new Stage(device, name);
            }
        });
    })());
}
