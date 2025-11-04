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

/**
 * @typedef {Readonly<Record<"ALL" | "STENCIL" | "DEPTH", "all" | "stencil-only" | "depth-only">>} Aspect
 * @type {Aspect}
 */
export const ASPECT = /*@__PURE__*/ CreateConstantObject(
{
    ALL: "all",
    STENCIL: "stencil-only",
    DEPTH: "depth-only"
});

/**
 * @typedef {Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", "clamp-to-edge" | "repeat" | "mirror-repeat">>} Address
 * @type {Address}
 */
export const ADDRESS = /*@__PURE__*/ CreateConstantObject(
{
    CLAMP: "clamp-to-edge",
    REPEAT: "repeat",
    MIRROR: "mirror-repeat"
});

/**
 * @typedef {Readonly<Record<"NEAREST" | "LINEAR", "nearest" | "linear">>} Filter
 * @type {Filter}
 */
export const FILTER = /*@__PURE__*/ CreateConstantObject(
{
    NEAREST: "nearest",
    LINEAR: "linear"
});

/**
 * @typedef {"NEVER" | "LESS" | "EQUAL" | "LESS_EQUAL" | "GREATER" | "NOT_EQUAL" | "GREATER_EQUAL" | "ALWAYS"} K
 * @typedef {"never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always"} V
 * @typedef {Readonly<Record<K, V>>} Compare
 * @type {Compare}
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
