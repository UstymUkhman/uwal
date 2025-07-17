/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.12
 * @license MIT
 */

/** @deprecated `LegacyCube`, use `CubeGeometry` instead. */
export { LegacyCube, Cube as CubeGeometry } from "#/geometries";
/** @deprecated `LegacyShape` use `Shape` instead. */
export { LegacyShape, Shape, SHAPE } from "#/shapes";
export { USAGE, BLEND_STATE } from "#/pipelines";
export { default as Device } from "#/Device";
export { default as Color } from "#/Color";
/** @deprecated Use `Device` interface instead. */
export { default as UWAL } from "#/Device";
export { ERROR_CAUSE } from "#/Errors";
export * as Shaders from "#/shaders";
export { TEXTURE } from "#/textures";
/** @deprecated Use `MSDFText` instead. */
export { SDFText } from "#/text";

export
{
    OrthographicCamera,
    PerspectiveCamera,
    Camera2D
}
from "#/cameras";

import
{
    DegreesToRadians,
    RadiansToDegrees,
    /** @deprecated Use `GPUTiming` instead. */
    LegacyGPUTiming,
    EuclideanModulo,
    SmootherStep,
    SmoothStep,
    GPUTiming
}
from "#/utils";

export const Utils =
{
    DegreesToRadians,
    RadiansToDegrees,
    /** @deprecated Use `GPUTiming` instead. */
    LegacyGPUTiming,
    EuclideanModulo,
    SmootherStep,
    SmoothStep,
    GPUTiming
};

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
