import { throwError } from "@/Errors";
import { ERROR } from "@/Constants";

export default class RenderPipeline
{
    /** @type {GPUDevice} */ #Device;

    /** @param {GPUDevice} [device = undefined] */
    constructor(device)
    {
        if (!device) throwError(ERROR.DEVICE_NOT_REQUESTED);

        this.#Device = device;
    }
}
