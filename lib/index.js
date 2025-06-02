/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.11
 * @license MIT
 */

/// <reference types="../typings" />

export { default as Device } from "#/Device";
export { default as Color } from "#/Color";
/** @deprecated Use `Device` interface instead. */
export { default as UWAL } from "#/Device";
export * as Geometries from "#/geometries";
export { BLEND_STATE } from "#/pipelines";
export { Shape, SHAPE } from "#/shapes";
export { ERROR_CAUSE } from "#/Errors";
export * as Shaders from "#/shaders";
export { TEXTURE } from "#/textures";
export { SDFText } from "#/text";

import
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    GPUTiming
}
from "#/utils";

export const Utils =
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    GPUTiming
};

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
