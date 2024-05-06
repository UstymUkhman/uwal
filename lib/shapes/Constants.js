import { CreateConstantObject } from "@/Utils";

/**
 * @typedef {"TRIANGLE"  |
 *           "SQUARE"    |
 *           "PENTAGON"  |
 *           "HEXAGON"   |
 *           "HEPTAGON"  |
 *           "OCTAGON"   |
 *           "NONAGON"   |
 *           "DECAGON"   |
 *           "DODECAGON" |
 *           "CUSTOM"
 * } ShapeType
 *
 * @type {Readonly<Record<ShapeType, number | undefined>>}
 */
export const SEGMENTS = CreateConstantObject(
{
    TRIANGLE: 3,
    SQUARE: 4,
    PENTAGON: 5,
    HEXAGON: 6,
    HEPTAGON: 7,
    OCTAGON: 8,
    NONAGON: 9,
    DECAGON: 10,
    DODECAGON: 12,
    CUSTOM: undefined
});
