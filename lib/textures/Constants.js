/** @module TEXTURE */

import { CreateConstantObject } from "#/utils";

/**
 * Some utility bitmasks of the `GPUTextureUsage` flags.
 * - `USAGE.RENDER` is the default usage when creating a texture.
 * - `USAGE.STORAGE` is the default usage when creating a storage texture.
 *
 * @typedef {Readonly<Record<"RENDER" | "STORAGE", GPUTextureUsageFlags>>} Usage
 * @type {Usage}
 */
export const USAGE = /*@__PURE__*/ CreateConstantObject(
{
    RENDER: GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST,

    STORAGE: GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING
});

/**
 * @alias [GPUTextureAspect](https://www.w3.org/TR/webgpu/#enumdef-gputextureaspect)
 * @type {Readonly<Record<"ALL" | "STENCIL" | "DEPTH", GPUTextureAspect>>}
 */
export const ASPECT = /*@__PURE__*/ CreateConstantObject(
{
    ALL: "all",
    STENCIL: "stencil-only",
    DEPTH: "depth-only"
});

/**
 * @alias [GPUAddressMode](https://www.w3.org/TR/webgpu/#enumdef-gpuaddressmode)
 * @typedef {Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", GPUAddressMode>>} Address
 * @type {Address}
 */
export const ADDRESS = /*@__PURE__*/ CreateConstantObject(
{
    CLAMP: "clamp-to-edge",
    REPEAT: "repeat",
    MIRROR: "mirror-repeat"
});

/**
 * @alias [GPUFilterMode](https://www.w3.org/TR/webgpu/#enumdef-gpufiltermode)
 * @typedef {Readonly<Record<"NEAREST" | "LINEAR", GPUFilterMode>>} Filter
 * @type {Filter}
 */
export const FILTER = /*@__PURE__*/ CreateConstantObject(
{
    NEAREST: "nearest",
    LINEAR: "linear"
});

/**
 * @alias [GPUCompareFunction](https://www.w3.org/TR/webgpu/#enumdef-gpucomparefunction)
 * @typedef {"NEVER" | "LESS" | "EQUAL" | "LESS_EQUAL" | "GREATER" | "NOT_EQUAL" | "GREATER_EQUAL" | "ALWAYS"} Compare
 * @type {Readonly<Record<Compare, GPUCompareFunction>>}
 */
export const COMPARE = /*@__PURE__*/ CreateConstantObject(
{
    NEVER: "never",
    LESS: "less",
    EQUAL: "equal",
    LESS_EQUAL: "less-equal",
    GREATER: "greater",
    NOT_EQUAL: "not-equal",
    GREATER_EQUAL: "greater-equal",
    ALWAYS: "always"
});
