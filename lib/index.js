/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.0.12
 * @license MIT
 */

export { LegacyCube as CubeGeometry } from "#/geometries";
export { USAGE, BLEND_STATE } from "#/pipelines";
export { default as Device } from "#/Device";
export { default as Color } from "#/Color";
/** @deprecated Use `Device` interface instead. */
export { default as UWAL } from "#/Device";
/** @deprecated Use `CubeGeometry` instead. */
export * as Geometries from "#/geometries";
export { Shape, SHAPE } from "#/shapes";
export { ERROR_CAUSE } from "#/Errors";
export * as Shaders from "#/shaders";
export { TEXTURE } from "#/textures";
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
    EuclideanModulo,
    SmootherStep,
    SmoothStep,
    GPUTiming
};

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
