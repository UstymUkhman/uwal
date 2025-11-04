/// <reference types="vite-plugin-glsl/ext" />
/// <reference types="@webgpu/types" />
/// <reference types="wgpu-matrix" />

declare const VERSION: string;

declare type Renderer = import("#/stages/RenderStage").default;
declare type Computation = import("#/stages/ComputeStage").default;
declare type RenderPipeline = import("#/pipelines/RenderPipeline").RenderPipeline;
declare type ComputePipeline = import("#/pipelines/ComputePipeline").ComputePipeline;
