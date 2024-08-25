import { CreateConstantObject } from "@/Utils";

import
{
    ERROR as PIPELINE_ERROR,
    ERROR_MESSAGE as PIPELINE_ERROR_MESSAGE,
    ERROR_CAUSE as PIPELINE_ERROR_CAUSE
}
from "@/pipelines/Errors";

import
{
    ERROR as TEXTURE_ERROR,
    ERROR_MESSAGE as TEXTURE_ERROR_MESSAGE
}
from "@/textures/Errors";

import
{
    ERROR as SHAPE_ERROR,
    ERROR_MESSAGE as SHAPE_ERROR_MESSAGE
}
from "@/shapes/Errors";

export const EVENT = CreateConstantObject(
{
    DEVICE_LOST: "Device::Lost"
});

export const ERROR = CreateConstantObject(
{
    FORMAT_NOT_SUPPORTED: "FORMAT_NOT_SUPPORTED",
    WEBGPU_NOT_SUPPORTED: "WEBGPU_NOT_SUPPORTED",
    ADAPTER_NOT_FOUND: "ADAPTER_NOT_FOUND",
    FEATURE_NOT_FOUND: "FEATURE_NOT_FOUND",
    DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
    DEVICE_NOT_REQUESTED: "DEVICE_NOT_REQUESTED",
    DEVICE_LOST: "DEVICE_LOST",
    ...PIPELINE_ERROR,
    ...TEXTURE_ERROR,
    ...SHAPE_ERROR
});

export const ERROR_MESSAGE = CreateConstantObject(
{
    FORMAT_NOT_SUPPORTED: "Format is not yet supported: ",
    WEBGPU_NOT_SUPPORTED: "WebGPU is not supported in this browser.",
    ADAPTER_NOT_FOUND: "Failed to get a GPUAdapter.",
    DEVICE_NOT_FOUND: "Failed to get a GPUDevice.",
    FEATURE_NOT_FOUND: "Failed to get a GPUFeature ",
    DEVICE_NOT_REQUESTED: "GPUDevice was not requested.",
    DEVICE_LOST: "WebGPU device was lost. ",
    ...PIPELINE_ERROR_MESSAGE,
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
    ...PIPELINE_ERROR_CAUSE
});

/**
 * @param {typeof ERROR[keyof typeof ERROR]} warning
 * @param {string} [message]
 */
export function ThrowWarning(warning, message)
{
    console.warn(ERROR_MESSAGE[warning] + (message ?? ""));
}

/**
 * @param {typeof ERROR[keyof typeof ERROR]} error
 * @param {string} [message]
 */
export function ThrowError(error, message)
{
    throw new Error(ERROR_MESSAGE[error] + (message ?? ""), { cause: ERROR_CAUSE[error] });
}
