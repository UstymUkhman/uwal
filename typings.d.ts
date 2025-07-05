/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

declare type ConfigurationOptions = import("./lib/Device").ConfigurationOptions;
declare type LegacyComputation = import("./lib/Device").LegacyComputation;
declare type LegacyRenderer = import("./lib/Device").LegacyRenderer;
declare type Computation = import("./lib/Device").Computation;
declare type Renderer = import("./lib/Device").Renderer;

declare const GUI: Object;
