/** @type {Readonly<Record<"RENDER", GPUTextureUsageFlags>>} */
export const USAGE: Readonly<Record<"RENDER", GPUTextureUsageFlags>>;
/** @type {Readonly<Record<"ALL" | "STENCIL" | "DEPTH", "all" | "stencil-only" | "depth-only">>} */
export const ASPECT: Readonly<Record<"ALL" | "STENCIL" | "DEPTH", "all" | "stencil-only" | "depth-only">>;
/** @type {Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", "clamp-to-edge" | "repeat" | "mirror-repeat">>} */
export const ADDRESS: Readonly<Record<"CLAMP" | "REPEAT" | "MIRROR", "clamp-to-edge" | "repeat" | "mirror-repeat">>;
/** @type {Readonly<Record<"NEAREST" | "LINEAR", "nearest" | "linear">>} */
export const FILTER: Readonly<Record<"NEAREST" | "LINEAR", "nearest" | "linear">>;
/**
 * @typedef {"NEVER" | "LESS" | "EQUAL" | "LESS_EQUAL" | "GREATER" | "NOT_EQUAL" | "GREATER_EQUAL" | "ALWAYS"} K
 * @typedef {"never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always"} V
 * @type {Readonly<Record<K, V>>}
 */
export const COMPARE: Readonly<Record<K, V>>;
export type K = "NEVER" | "LESS" | "EQUAL" | "LESS_EQUAL" | "GREATER" | "NOT_EQUAL" | "GREATER_EQUAL" | "ALWAYS";
export type V = "never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always";
//# sourceMappingURL=Constants.d.ts.map