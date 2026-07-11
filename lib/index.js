/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.5.0
 * @license MIT
 */

export { Scene } from "./Scene";
export { Device } from "./Device";
export { MSDFText } from "./text";
export * as Shaders from "./shaders";
export { ERROR_CAUSE } from "./Errors";
export * as Geometries from "./geometries";
export { Color, MathUtils } from "./utils";
export { Renderer, Computation } from "./stages";
export { Node, Node2D, Mesh, Shape } from "./primitives";
export { default as TextureUtils, TEXTURE } from "./textures";
export { BLEND_STATE, USAGE, BINDINGS } from "./pipelines/Constants";
export { OrthographicCamera, PerspectiveCamera, Camera2D } from "./cameras";
export { AmbientLight, DirectionalLight, PointLight, SpotLight } from "./lights";

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
