import { CreateConstantObject } from "#/utils";

import
{
    ERROR as PRIMITIVES_ERROR,
    ERROR_MESSAGE as PRIMITIVES_ERROR_MESSAGE
}
from "#/primitives/Errors";

import
{
    ERROR as GEOMETRIES_ERROR,
    ERROR_MESSAGE as GEOMETRIES_ERROR_MESSAGE
}
from "#/geometries/Errors";

import
{
    ERROR as PIPELINES_ERROR,
    ERROR_MESSAGE as PIPELINES_ERROR_MESSAGE,
    ERROR_CAUSE as PIPELINES_ERROR_CAUSE
}
from "#/pipelines/Errors";

import
{
    ERROR as STAGES_ERROR,
    ERROR_MESSAGE as STAGES_ERROR_MESSAGE,
    ERROR_CAUSE as STAGES_ERROR_CAUSE
}
from "#/stages/Errors";

import
{
    ERROR as UTILS_ERROR,
    ERROR_MESSAGE as UTILS_ERROR_MESSAGE
}
from "#/utils/Errors";

import
{
    ERROR as TEXT_ERROR,
    ERROR_MESSAGE as TEXT_ERROR_MESSAGE
}
from "#/text/Errors";

/** @hidden */
export const ERROR = /*@__PURE__*/ CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: "WEBGPU_NOT_SUPPORTED",
    ADAPTER_NOT_FOUND: "ADAPTER_NOT_FOUND",
    FEATURE_NOT_FOUND: "FEATURE_NOT_FOUND",
    DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
    DEVICE_LOST: "DEVICE_LOST",
    INVALID_CALL: "INVALID_CALL",
    ...PRIMITIVES_ERROR,
    ...GEOMETRIES_ERROR,
    ...PIPELINES_ERROR,
    ...STAGES_ERROR,
    ...UTILS_ERROR,
    ...TEXT_ERROR
});

/** @hidden */
export const ERROR_MESSAGE = /*@__PURE__*/ CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: "WebGPU is not supported in this browser.",
    ADAPTER_NOT_FOUND: "Failed to get a GPUAdapter.",
    DEVICE_NOT_FOUND: "Failed to get a GPUDevice.",
    FEATURE_NOT_FOUND: "Failed to get a GPUFeature ",
    DEVICE_LOST: "WebGPU device was lost. ",
    INVALID_CALL: "Invalid call to the following ",
    ...PRIMITIVES_ERROR_MESSAGE,
    ...GEOMETRIES_ERROR_MESSAGE,
    ...PIPELINES_ERROR_MESSAGE,
    ...STAGES_ERROR_MESSAGE,
    ...UTILS_ERROR_MESSAGE,
    ...TEXT_ERROR_MESSAGE
});

/**
 * Possible internal errors and their `cause` values to handle them gracefully.
 *
 * @typedef {"WEBGPU_NOT_SUPPORTED"      |
 *           "ADAPTER_NOT_FOUND"         |
 *           "DEVICE_NOT_FOUND"          |
 *           "DEVICE_LOST"               |
 *           "CANVAS_NOT_FOUND"          |
 *           "CONTEXT_NOT_FOUND"         |
 *           "COMMAND_ENCODER_NOT_FOUND" |
 *           "PIPELINE_NOT_FOUND"
 * } ErrorCause
 *
 * @type {Readonly<Record<ErrorCause, number>>}
 */
export const ERROR_CAUSE = /*@__PURE__*/ CreateConstantObject(
{
    WEBGPU_NOT_SUPPORTED: 0,
    ADAPTER_NOT_FOUND: 1,
    DEVICE_NOT_FOUND: 2,
    DEVICE_LOST: 3,
    ...STAGES_ERROR_CAUSE,
    ...PIPELINES_ERROR_CAUSE
});

/**
 * @hidden
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
 * @hidden
 * @param {string} warning
 * @param {string} [message]
 */
export function ThrowWarning(warning, message)
{
    const warningKey = /** @type {keyof typeof ERROR} */ (warning);
    console.warn(`${ERROR_MESSAGE[warningKey]}${message ?? ""}`.replace(/\s\s+/g, " "));
}
