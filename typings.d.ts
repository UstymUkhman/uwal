/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

declare type ConfigurationOptions = import("./lib/Device").ConfigurationOptions;
declare type LegacyComputation = import("./lib/Device").LegacyComputation;
declare type LegacyRenderer = import("./lib/Device").LegacyRenderer;

declare const GUI: Object;
