/// <reference types="vite-plugin-glsl/ext" />
/// <reference types="@webgpu/types" />
/// <reference types="wgpu-matrix" />
/// <reference types="vite/client" />

declare const VERSION: string;

declare module '*.json'
{
    export default JSON;
}
