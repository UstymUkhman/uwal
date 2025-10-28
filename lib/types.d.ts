declare const VERSION: string;

/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

declare type Renderer = import("#/stages/RenderStage").default;
declare type Computation = import("#/stages/ComputeStage").default;
declare type RenderPipeline = import("#/pipelines/RenderPipeline").RenderPipeline;
declare type ComputePipeline = import("#/pipelines/ComputePipeline").ComputePipeline;
