/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.2.3
 * @license MIT
 */

export { MSDFText } from "#/text";
export { TEXTURE } from "#/textures";
export * as Shaders from "#/shaders";
export { ERROR_CAUSE } from "#/Errors";
export * as Materials from "#/materials";
export * as Geometries from "#/geometries";
export { default as Scene } from "#/Scene";
export { default as Device } from "#/Device";
export { Node, Mesh, Shape } from "#/primitives";
export { Color, GPUTiming, MathUtils } from "#/utils";
export { BLEND_STATE, USAGE } from "#/pipelines/Constants";
export { DirectionalLight, PointLight, SpotLight } from "#/lights";
export { OrthographicCamera, PerspectiveCamera, Camera2D } from "#/cameras";

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
