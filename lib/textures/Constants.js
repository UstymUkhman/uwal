import { CreateConstantObject } from "#/utils";

/** @type {Readonly<Record<"RENDER" | "STORAGE", GPUTextureUsageFlags>>} */
export const USAGE = CreateConstantObject(
{
    RENDER: GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST,

    STORAGE: GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING
});

/** @type {Readonly<Record<"ALL" | "STENCIL" | "DEPTH", "all" | "stencil-only" | "depth-only">>} */
export const ASPECT = CreateConstantObject(
{
    ALL: "all",
    STENCIL: "stencil-only",
    DEPTH: "depth-only"
});

/** @type {Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", "clamp-to-edge" | "repeat" | "mirror-repeat">>} */
export const ADDRESS = CreateConstantObject(
{
    CLAMP: "clamp-to-edge",
    REPEAT: "repeat",
    MIRROR: "mirror-repeat"
});

/** @type {Readonly<Record<"NEAREST" | "LINEAR", "nearest" | "linear">>} */
export const FILTER = CreateConstantObject(
{
    NEAREST: "nearest",
    LINEAR: "linear"
});

/**
 * @typedef {"NEVER" | "LESS" | "EQUAL" | "LESS_EQUAL" | "GREATER" | "NOT_EQUAL" | "GREATER_EQUAL" | "ALWAYS"} K
 * @typedef {"never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always"} V
 * @type {Readonly<Record<K, V>>}
 */
export const COMPARE = CreateConstantObject(
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
