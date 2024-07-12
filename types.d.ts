/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

// Make "wgpu-matrix" types global:
declare type Mat3 = import("wgpu-matrix").Mat3;
declare type Mat4 = import("wgpu-matrix").Mat4;
declare type Quat = import("wgpu-matrix").Quat;

declare type Vec2 = import("wgpu-matrix").Vec2;
declare type Vec3 = import("wgpu-matrix").Vec3;
declare type Vec4 = import("wgpu-matrix").Vec4;

declare type Vec2n = import("wgpu-matrix").Vec2n;
declare type Vec3n = import("wgpu-matrix").Vec3n;
declare type Vec4n = import("wgpu-matrix").Vec4n;

// WebGPU Context Configuration Options:
declare type ConfigurationOptions =
{
    /** @default navigator.gpu.getPreferredCanvasFormat() */
    format?: GPUTextureFormat;
    /** @default GPUTextureUsage.RENDER_ATTACHMENT */
    usage?: GPUTextureUsageFlags;
    viewFormats?: Iterable<GPUTextureFormat>;
    /** @default "srgb" */
    colorSpace?: PredefinedColorSpace;
    /** @default "opaque" */
    alphaMode?: GPUCanvasAlphaMode;
};

declare const VERSION: string;

declare module '*.json'
{
    export default JSON;
}

declare const GUI;
