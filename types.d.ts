/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

export { ComputePipelineInstance as ComputePipeline } from "./types/pipelines/ComputePipeline";
export { RenderPipelineInstance as RenderPipeline } from "./types/pipelines/RenderPipeline";
export { AmbientLight, DirectionalLight, PointLight, SpotLight } from "./types/lights";
export { FlatMaterial, MatcapMaterial, WireframeMaterial } from "./types/materials";
export { Color, Texture, MathUtils } from "./types/utils/main";
export { default as MSDFText } from "./types/text";
export * as Shaders from "./types/shaders";

export
{
    PerspectiveCamera, OrthographicCamera, Camera2D,
    BINDINGS, BLEND_STATE, ERROR_CAUSE,
    MeshGeometry, ShapeGeometry,
    Node, Node2D, Mesh, Shape,
    Renderer, Computation,
    Device, Scene
}
from "./types/core";
