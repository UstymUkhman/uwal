import { ERROR as TEXTURE_ERROR, ERROR_MESSAGE as TEXTURE_ERROR_MESSAGE } from "@/textures/Errors";
import { ERROR as SHAPE_ERROR, ERROR_MESSAGE as SHAPE_ERROR_MESSAGE } from "@/shapes/Errors";
import { CreateConstantObject } from "@/Utils";

export const EVENT = CreateConstantObject(
{
    DEVICE_LOST: "Device::Lost"
});

export const ERROR = CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: "WEBGPU_NOT_SUPPORTED",
    ADAPTER_NOT_FOUND: "ADAPTER_NOT_FOUND",
    DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
    DEVICE_NOT_REQUESTED: "DEVICE_NOT_REQUESTED",
    DEVICE_LOST: "DEVICE_LOST",
    CANVAS_NOT_FOUND: "CANVAS_NOT_FOUND",
    CONTEXT_NOT_FOUND: "CONTEXT_NOT_FOUND",
    COMMAND_ENCODER_NOT_FOUND: "COMMAND_ENCODER_NOT_FOUND",
    PIPELINE_NOT_FOUND: "PIPELINE_NOT_FOUND",
    ...TEXTURE_ERROR,
    ...SHAPE_ERROR
});

export const ERROR_MESSAGE = CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: "WebGPU is not supported in this browser.",
    ADAPTER_NOT_FOUND: "Failed to get a GPUAdapter.",
    DEVICE_NOT_FOUND: "Failed to get a GPUDevice.",
    DEVICE_NOT_REQUESTED: "GPUDevice was not requested.",
    DEVICE_LOST: "WebGPU device was lost.",
    CANVAS_NOT_FOUND: "Failed to get a WebGPU canvas.",
    CONTEXT_NOT_FOUND: "Failed to get a WebGPU context.",
    COMMAND_ENCODER_NOT_FOUND: "Failed to get a GPUCommandEncoder.",
    PIPELINE_NOT_FOUND: "Failed to get a GPU",
    ...TEXTURE_ERROR_MESSAGE,
    ...SHAPE_ERROR_MESSAGE
});

export const ERROR_CAUSE = CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: 0,
    ADAPTER_NOT_FOUND: 1,
    DEVICE_NOT_FOUND: 2,
    DEVICE_NOT_REQUESTED: 3,
    DEVICE_LOST: 4,
    CANVAS_NOT_FOUND: 5,
    CONTEXT_NOT_FOUND: 6,
    COMMAND_ENCODER_NOT_FOUND: 7,
    PIPELINE_NOT_FOUND: 8
});

/**
 * @param {typeof ERROR[keyof typeof ERROR]} warning
 * @param {string} [message = undefined]
 */
export function ThrowWarning(warning, message)
{
    console.warn(ERROR_MESSAGE[warning] + (message ?? ""));
}

/**
 * @param {typeof ERROR[keyof typeof ERROR]} error
 * @param {string} [message = undefined]
 */
export function ThrowError(error, message)
{
    throw new Error(ERROR_MESSAGE[error] + (message ?? ""), { cause: ERROR_CAUSE[error] });
}
