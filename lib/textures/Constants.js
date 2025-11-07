import { CreateConstantObject } from "#/utils";

/**
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

/** @type {Readonly<Record<"ALL" | "STENCIL" | "DEPTH", GPUTextureAspect>>} */
export const ASPECT = /*@__PURE__*/ CreateConstantObject(
{
    ALL: "all",
    STENCIL: "stencil-only",
    DEPTH: "depth-only"
});

/**
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
 * @typedef {Readonly<Record<"NEAREST" | "LINEAR", GPUFilterMode>>} Filter
 * @type {Filter}
 */
export const FILTER = /*@__PURE__*/ CreateConstantObject(
{
    NEAREST: "nearest",
    LINEAR: "linear"
});

/**
 * @typedef {"NEVER" | "LESS" | "EQUAL" | "LESS_EQUAL" | "GREATER" | "NOT_EQUAL" | "GREATER_EQUAL" | "ALWAYS"} K
 * @type {Readonly<Record<K, GPUCompareFunction>>}
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
