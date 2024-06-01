import { CreateConstantObject } from "@/Utils";

/** @type {Readonly<Record<"STENCIL" | "DEPTH" | "ALL", "stencil-only" | "depth-only" | "all">>} */
export const ASPECT = CreateConstantObject(
{
    STENCIL: "stencil-only",
    DEPTH: "depth-only",
    ALL: "all"
});

/** @type {Readonly<Record<"MIRROR" | "CLAMP" | "REPEAT", "mirror-repeat" | "clamp-to-edge" | "repeat">>} */
export const ADDRESS = CreateConstantObject(
{
    MIRROR: "mirror-repeat",
    CLAMP: "clamp-to-edge",
    REPEAT: "repeat"
});


/** @type {Readonly<Record<"NEAREST" | "LINEAR", "nearest" | "linear">>} */
export const FILTER = CreateConstantObject(
{
    NEAREST: "nearest",
    LINEAR: "linear"
});

/**
 * @typedef {"GREATER_EQUAL" | "LESS_EQUAL" | "NOT_EQUAL" | "GREATER" | "ALWAYS" | "NEVER" | "EQUAL" | "LESS"} K
 * @typedef {"greater-equal" | "less-equal" | "not-equal" | "greater" | "always" | "never" | "equal" | "less"} V
 * @type {Readonly<Record<K, V>>}
 */
export const COMPARE = CreateConstantObject(
{
    GREATER_EQUAL: "greater-equal",
    LESS_EQUAL: "less-equal",
    NOT_EQUAL: "not-equal",
    GREATER: "greater",
    ALWAYS: "always",
    NEVER: "never",
    EQUAL: "equal",
    LESS: "less"
});
