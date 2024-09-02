// Internal global types:

/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

declare type Computation = import("./lib/UWAL").Computation;
declare type Renderer = import("./lib/UWAL").Renderer;

declare const GUI: Object;
