import { CreateConstantObject } from "#/utils";

import
{
    ERROR as PIPELINE_ERROR,
    ERROR_MESSAGE as PIPELINE_ERROR_MESSAGE,
    ERROR_CAUSE as PIPELINE_ERROR_CAUSE
}
from "#/pipelines/Errors";

import
{
    ERROR as TEXTURE_ERROR,
    ERROR_MESSAGE as TEXTURE_ERROR_MESSAGE
}
from "#/textures/Errors";

import
{
    ERROR as STAGE_ERROR,
    ERROR_MESSAGE as STAGE_ERROR_MESSAGE,
    ERROR_CAUSE as STAGE_ERROR_CAUSE
}
from "#/stages/Errors";

import
{
    ERROR as UTIL_ERROR,
    ERROR_MESSAGE as UTIL_ERROR_MESSAGE
}
from "#/utils/Errors";

import
{
    ERROR as TEXT_ERROR,
    ERROR_MESSAGE as TEXT_ERROR_MESSAGE
}
from "#/text/Errors";

export const EVENT = /*@__PURE__*/ CreateConstantObject(
{
    DEVICE_LOST: "Device::Lost"
});

export const ERROR = /*@__PURE__*/ CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: "WEBGPU_NOT_SUPPORTED",
    ADAPTER_NOT_FOUND: "ADAPTER_NOT_FOUND",
    FEATURE_NOT_FOUND: "FEATURE_NOT_FOUND",
    DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
    DEVICE_NOT_REQUESTED: "DEVICE_NOT_REQUESTED",
    DEVICE_LOST: "DEVICE_LOST",
    INVALID_CALL: "INVALID_CALL",
    ...PIPELINE_ERROR,
    ...TEXTURE_ERROR,
    ...STAGE_ERROR,
    ...UTIL_ERROR,
    ...TEXT_ERROR
});

export const ERROR_MESSAGE = /*@__PURE__*/ CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: "WebGPU is not supported in this browser.",
    ADAPTER_NOT_FOUND: "Failed to get a GPUAdapter.",
    DEVICE_NOT_FOUND: "Failed to get a GPUDevice.",
    FEATURE_NOT_FOUND: "Failed to get a GPUFeature ",
    DEVICE_NOT_REQUESTED: "GPUDevice was not requested.",
    DEVICE_LOST: "WebGPU device was lost. ",
    INVALID_CALL: "Invalid call to the following ",
    ...PIPELINE_ERROR_MESSAGE,
    ...TEXTURE_ERROR_MESSAGE,
    ...STAGE_ERROR_MESSAGE,
    ...UTIL_ERROR_MESSAGE,
    ...TEXT_ERROR_MESSAGE
});

/**
 * @typedef {
       "WEBGPU_NOT_SUPPORTED" | "ADAPTER_NOT_FOUND" | "DEVICE_NOT_FOUND" | "DEVICE_NOT_REQUESTED" | "DEVICE_LOST"
   } ErrorCause
 *
 * @type {Readonly<Record<
       keyof typeof import("./pipelines/Errors").ERROR_CAUSE |
       keyof typeof import("./stages/Errors").ERROR_CAUSE |
       ErrorCause, number
    >>}
 */
export const ERROR_CAUSE = /*@__PURE__*/ CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: 0,
    ADAPTER_NOT_FOUND: 1,
    DEVICE_NOT_FOUND: 2,
    DEVICE_NOT_REQUESTED: 3,
    DEVICE_LOST: 4,
    ...STAGE_ERROR_CAUSE,
    ...PIPELINE_ERROR_CAUSE
});

/**
 * @param {string} error
 * @param {string} [message]
 */
export function ThrowError(error, message)
{
    const errorKey = /** @type {keyof typeof ERROR} */ (error);
    const cause = ERROR_CAUSE[/** @type {keyof typeof ERROR_CAUSE} */ (error)];
    throw new Error(`${ERROR_MESSAGE[errorKey]}${message ?? ""}`.replace(/\s\s+/g, " "), { cause });
}

/**
 * @param {string} warning
 * @param {string} [message]
 */
export function ThrowWarning(warning, message)
{
    const warningKey = /** @type {keyof typeof ERROR} */ (warning);
    console.warn(`${ERROR_MESSAGE[warningKey]}${message ?? ""}`.replace(/\s\s+/g, " "));
}
