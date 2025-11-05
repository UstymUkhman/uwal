/// <reference types="vite-plugin-glsl/ext" />
/// <reference types="@webgpu/types" />
/// <reference types="wgpu-matrix" />

declare const VERSION: string;

declare type Renderer = import("#/stages/RenderStage").default;
declare type Computation = import("#/stages/ComputeStage").default;
declare type RenderPipeline = import("#/pipelines/RenderPipeline").RenderPipelineInstance;
declare type ComputePipeline = import("#/pipelines/ComputePipeline").ComputePipelineInstance;
