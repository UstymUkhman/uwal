/**
 * @typedef {"REQUIRED_SEGMENTS"} ShapeErrorCause
 * @type {Readonly<Record<ShapeErrorCause, ShapeErrorCause>>}
 */
export const ERROR =
{
    REQUIRED_SEGMENTS: "REQUIRED_SEGMENTS"
};

/** @type {Readonly<Record<ShapeErrorCause, string>>} */
export const ERROR_MESSAGE =
{
    REQUIRED_SEGMENTS: "Shape `segments` is required to be a integer number."
};
