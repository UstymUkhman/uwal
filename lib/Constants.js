/** @param {Record<string, unknown>} values */
function createConstantsObject(values)
{
    /** @type {object} */ const constants = {};

    for (let value in values)
        constants[value] = { value: values[value] };

    return Object.freeze(Object.create(null, constants));
}

/**
 * @typedef {"WEBGPU_NOT_SUPPORTED"  |
 *           "ADAPTER_NOT_FOUND"     |
 *           "DEVICE_NOT_FOUND"      |
 *           "DEVICE_NOT_REQUESTED"  |
 *           "DEVICE_LOST"           |
 *           "CONTEXT_NOT_SUPPORTED"
 * } ErrorCause
 *
 * @type {Readonly<Record<ErrorCause, ErrorCause>>}
 */
export const ERROR = createConstantsObject(
{
    WEBGPU_NOT_SUPPORTED: "WEBGPU_NOT_SUPPORTED",
    ADAPTER_NOT_FOUND: "ADAPTER_NOT_FOUND",
    DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
    DEVICE_NOT_REQUESTED: "DEVICE_NOT_REQUESTED",
    DEVICE_LOST: "DEVICE_LOST",
    CONTEXT_NOT_SUPPORTED: "CONTEXT_NOT_SUPPORTED"
}
);

/** @type {Readonly<Record<ErrorCause, string>>} */
export const ERROR_MESSAGE = createConstantsObject(
{
    WEBGPU_NOT_SUPPORTED: "WebGPU is not supported in this browser.",
    ADAPTER_NOT_FOUND: "Failed to find a GPUAdapter.",
    DEVICE_NOT_FOUND: "Failed to find a GPUDevice.",
    DEVICE_NOT_REQUESTED: "GPUDevice was not requested.",
    DEVICE_LOST: "WebGPU device was lost.",
    CONTEXT_NOT_SUPPORTED: "Failed to get a WebGPU context."
});

/** @type {Readonly<Record<ErrorCause, number>>} */
export const ERROR_CAUSE = createConstantsObject(
{
    WEBGPU_NOT_SUPPORTED: 0,
    ADAPTER_NOT_FOUND: 1,
    DEVICE_NOT_FOUND: 2,
    DEVICE_NOT_REQUESTED: 3,
    DEVICE_LOST: 4,
    CONTEXT_NOT_SUPPORTED: 5
});
