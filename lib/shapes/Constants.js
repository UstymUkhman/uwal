import { CreateConstantObject } from "#/utils";

/**
 * @typedef {Readonly<Record<
       "TRIANGLE" |
       "SQUARE" |
       "PENTAGON" |
       "HEXAGON" |
       "HEPTAGON" |
       "OCTAGON" |
       "NONAGON" |
       "DECAGON" |
       "DODECAGON",
       number
   >>} Segments
 * @type {Segments}
 */
export default /*#__PURE__*/ CreateConstantObject(
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
