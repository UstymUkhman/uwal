/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.1.1
 * @license MIT
 */

export { USAGE, BLEND_STATE } from "#/pipelines/Constants";
export { Node, Mesh, Shape } from "#/primitives";
export { GPUTiming, MathUtils } from "#/utils";
export { default as Device } from "#/Device";
export { default as Scene } from "#/Scene";
export { default as Color } from "#/Color";
export * as Geometries from "#/geometries";
export * as Materials from "#/materials";
export { ERROR_CAUSE } from "#/Errors";
export * as Shaders from "#/shaders";
export { TEXTURE } from "#/textures";
/** @deprecated `SDFText` will be replaced by `MSDFText`. */
export { SDFText } from "#/text";

export
{
    OrthographicCamera,
    PerspectiveCamera,
    Camera2D
}
from "#/cameras";

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
