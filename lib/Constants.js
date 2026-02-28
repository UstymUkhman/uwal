import { CreateConstantObject } from "#/utils";

/**
 * @todo Move `CullTest` constants here.
 * @exports Segments
 */

/**
 * @typedef {Readonly<Record<
 *     "TRIANGLE" |
 *     "SQUARE"   |
 *     "PENTAGON" |
 *     "HEXAGON"  |
 *     "HEPTAGON" |
 *     "OCTAGON"  |
 *     "NONAGON"  |
 *     "DECAGON"  |
 *     "DODECAGON",
 *     number
 * >>} Segments
 * @type {Segments}
 */
export const SEGMENTS = /*@__PURE__*/ CreateConstantObject(
{
    TRIANGLE: 3,
    SQUARE: 4,
    PENTAGON: 5,
    HEXAGON: 6,
    HEPTAGON: 7,
    OCTAGON: 8,
    NONAGON: 9,
    DECAGON: 10,
    DODECAGON: 12
});

/**
 * @typedef {"MIPMAP_SAMPLER" | "MIPMAP_TEXTURE"} Binding
 * @type {Readonly<Record<Binding, GPUIndex32>>}
 */
export const BINDINGS = /*@__PURE__*/ CreateConstantObject(
{
    RESOLUTION_BUFFER: 0,
    MIPMAP_SAMPLER: 5,
    MIPMAP_TEXTURE: 6,
    CAMERA_MATRIX: 10
});
