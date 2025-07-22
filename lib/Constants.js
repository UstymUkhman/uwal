import { CreateConstantObject } from "#/utils";

/**
 * @typedef {Record<"RAD" | "DEG" | "HPI" | "TAU", number>} Number
 * @type {Number}
 */
export const NUMBER = /*#__PURE__*/ CreateConstantObject(
{
    RAD: Math.PI / 180,
    DEG: 180 / Math.PI,

    HPI: Math.PI / 2,
    TAU: Math.PI * 2
});
