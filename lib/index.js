/**
 * @module UWAL
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description Unopinionated WebGPU Abstraction Library
 * @version 0.5.0
 * @license MIT
 */

export
{
    Renderer, Computation,
    Device, Scene, Skybox,
    Node, Node2D, Mesh, Shape,
    MeshGeometry, ShapeGeometry,
    BINDINGS, BLEND_STATE, ERROR_CAUSE,
    PerspectiveCamera, OrthographicCamera, Camera2D
}
from "#/core";

export * as Shaders from "./shaders";
export { default as MSDFText } from "./text";
export { Color, Texture, MathUtils } from "./utils/export";
export { FlatMaterial, MatcapMaterial, WireframeMaterial } from "./materials";
export { AmbientLight, DirectionalLight, PointLight, SpotLight } from "./lights";
