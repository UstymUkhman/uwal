/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />

declare type Renderer = import("./lib/stages/RenderStage").default;
declare type Computation = import("./lib/stages/ComputeStage").default;
declare type RenderPipeline = import("./lib/pipelines/RenderPipeline").RenderPipeline;
declare type ComputePipeline = import("./lib/pipelines/ComputePipeline").ComputePipeline;
