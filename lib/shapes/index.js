import { SEGMENTS } from "@/shapes/Constants";
import { CreateConstantObject } from "@/Utils";

export { default as Shape } from "@/shapes/Shape";

/**
 * @typedef {Object} ShapeConstants
 * @property {import("./Constants").ShapeSegments} SEGMENTS
*/

/** @type {ShapeConstants} */
export const SHAPE = CreateConstantObject({ SEGMENTS });
