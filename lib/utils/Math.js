/**
 * @module MathUtils
 * @description A set of mathematical objects and functions for general-purpose usage.
 * [Type Aliases](#type-aliases) are [namespaces](https://wgpu-matrix.org/docs/modules.html) and [utils](https://wgpu-matrix.org/docs/modules/utils.html)
 * re-exported from [wgpu-matrix](https://github.com/greggman/wgpu-matrix), so their original documentation is completely relevant for this module.
 */

/**
 * @typedef {import("wgpu-matrix").mat3} Mat3
 * @typedef {import("wgpu-matrix").mat4} Mat4
 * @typedef {import("wgpu-matrix").quat} Quat
 * @typedef {import("wgpu-matrix").vec2} Vec2
 * @typedef {import("wgpu-matrix").vec3} Vec3
 * @typedef {import("wgpu-matrix").vec4} Vec4
 *
 * @typedef {import("wgpu-matrix").utils.EPSILON} EPSILON
 * @typedef {import("wgpu-matrix").utils.degToRad} DegreesToRadians
 * @typedef {import("wgpu-matrix").utils.euclideanModulo} EuclideanModulo
 * @typedef {import("wgpu-matrix").utils.inverseLerp} InverseLerp
 * @typedef {import("wgpu-matrix").utils.lerp} Lerp
 * @typedef {import("wgpu-matrix").utils.radToDeg} RadiansToDegrees
 * @typedef {import("wgpu-matrix").utils.setEpsilon} SetEpsilon
 */

import { mat3, mat4, quat, vec2, vec3, vec4, utils } from "wgpu-matrix";
import { ERROR, ThrowWarning } from "#/Errors";

const vec = /*@__PURE__*/ vec3.create();

/**
 * @hidden
 * Also known as "The Golden Ratio",
 * defined as `Math.sqrt(5) * 0.5 + 0.5`.
 */
// export const PHI = Math.sqrt(5) * 0.5 + 0.5;

/**
 * @hidden
 * Roughly a frame duration in `ms` at 60 fps,
 * minimal significant value for the `setTimeout`
 * and `setInterval` functions, defined as `1 / 0.06`.
 */
// export const DELTA_UPDATE = 1 / 0.06;

/**
 * @hidden
 * Same as `DELTA_UPDATE`, but normalized
 * to a second, defined as `1 / 60`.
 */
// export const DELTA_FRAME = 1 / 60;

/**
 * @hidden
 * Used in conversions from degrees,
 * defined as `Math.PI / 180`.
 */
// export const RAD = Math.PI / 180;

/**
 * @hidden
 * Used in conversions from radians,
 * defined as `180 / Math.PI`.
 */
// export const DEG = 180 / Math.PI;

/** Half PI, defined as `Math.PI / 2`. */
export const HPI = Math.PI / 2;

/** Double PI, defined as `Math.PI * 2`. */
export const TAU = Math.PI * 2;

/**
 * Constrain a number between `min` and `max` values (inclusive).
 *
 * @param {number} value - Number to clamp
 * @param {number} [min = 0] - Lower limit
 * @param {number} [max = 1] - Upper limit
 */
export function Clamp(value, min = 0, max = 1)
{
    return Math.max(min, Math.min(value, max));
}

/**
 * Get a pseudorandom float between `min` (inclusive) and `max` (exclusive).
 *
 * @param {number} [min = 0] - Lower limit
 * @param {number} [max = 1] - Upper limit
 */
export function Random(min = 0, max = 1)
{
    return Math.random() * (max - min) + min;
}

/**
 * Get a pseudorandom integer between `min` (inclusive) and `max` (exclusive).
 *
 * @param {number} min - Lower limit
 * @param {number} max - Upper limit
 */
export function RandomInt(min, max)
{
    return (Math.random() * (max - min + 1) | 0) + min;
}

/**
 * Perform Hermite interpolation between two values.
 * Adapted from GLSL's [smoothstep](https://registry.khronos.org/OpenGL-Refpages/gl4/html/smoothstep.xhtml) function.
 *
 * @param {number} value - Value to interpolate
 * @param {number} [min = 0] - Lower limit
 * @param {number} [max = 1] - Upper limit
 */
export function SmoothStep(value, min = 0, max = 1)
{
    if (value <= min) return 0;
    if (value >= max) return 1;

    value = (value - min) / (max - min);
    return value * value * (3 - 2 * value);
}

/**
 * A variation on the [SmoothStep](#smoothstep) function that has zero 1st and 2nd order derivatives at `x = 0` and `x = 1`.
 * Adapted from three.js' [smootherstep](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/MathUtils.js#L187) function.
 *
 * @param {number} value - Value to interpolate
 * @param {number} [min = 0] - Lower limit
 * @param {number} [max = 1] - Upper limit
 */
export function SmootherStep(value, min = 0, max = 1)
{
    if (value <= min) return 0;
    if (value >= max) return 1;

    value = (value - min) / (max - min);
    return value * value * value * (value * (value * 6 - 15) + 10);
}

/**
 * @hidden
 * Set the destination matrix to the transformation composed of the given position, rotation and scale.
 * Adapted from three.js' [compose](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/Matrix4.js#L1029) method.
 *
 * @param {import("wgpu-matrix").Vec3} position - Position vector
 * @param {import("wgpu-matrix").Quat} rotation - Rotation quaternion
 * @param {import("wgpu-matrix").Vec3} scale - Scale vector
 * @param {import("wgpu-matrix").Mat4} [dst] - Destination matrix
 */
/* export function ComposeMat4(position, rotation, scale, dst = mat4.identity())
{
    const rx = rotation[0], ry = rotation[1], rz = rotation[2], rw = rotation[3];

    const x2 = rx + rx, y2 = ry + ry, z2 = rz + rz;
    const xx = rx * x2, xy = rx * y2, xz = rx * z2;
    const yy = ry * y2, yz = ry * z2, zz = rz * z2;
    const wx = rw * x2, wy = rw * y2, wz = rw * z2;

    const sx = scale[0], sy = scale[1], sz = scale[2];

    return mat4.set(
        (1 - (yy + zz)) * sx, (xy + wz) * sx      , (xz - wy) * sx      , 0,
        (xy - wz) * sy      , (1 - (xx + zz)) * sy, (yz + wx) * sy      , 0,
        (xz + wy) * sz      , (yz - wx) * sz      , (1 - (xx + yy)) * sz, 0,
        position[0]         , position[1]         , position[2]         , 1,
        dst
    );
} */

/**
 * Copy matrix rotation component into the given 4x4 matrix.
 * Adapted from three.js' [extractRotation](https://github.com/mrdoob/three.js/blob/ad6961f7fcb52cc3eec877faeb26ea11f611165f/src/math/Matrix4.js#L289) method.
 *
 * @param {import("wgpu-matrix").Mat4} src - Matrix to extract rotation
 * @param {import("wgpu-matrix").Mat4} [dst] - Destination matrix
 */
export function CopyMat4Rotation(src, dst = mat4.identity())
{
    if (!mat4.determinant(src)) return mat4.identity(dst);

    vec3.set(src[0], src[1], src[2], vec);
    const scaleX = 1 / vec3.length(vec);

    vec3.set(src[4], src[5], src[6], vec);
    const scaleY = 1 / vec3.length(vec);

    vec3.set(src[8], src[9], src[10], vec);
    const scaleZ = 1 / vec3.length(vec);

    dst[0] = src[0] * scaleX;
    dst[1] = src[1] * scaleX;
    dst[2] = src[2] * scaleX;
    dst[3] = 0;

    dst[4] = src[4] * scaleY;
    dst[5] = src[5] * scaleY;
    dst[6] = src[6] * scaleY;
    dst[7] = 0;

    dst[ 8] = src[ 8] * scaleZ;
    dst[ 9] = src[ 9] * scaleZ;
    dst[10] = src[10] * scaleZ;
    dst[11] = 0;

    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
}

/**
 * Get matrix rotation as Euler angles assuming the upper 3x3 matrix is a pure rotation matrix.
 * Adapted from ogl's [fromRotationMatrix](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/EulerFunc.js#L2) function.
 * @throws `ERROR.INVALID_ROTATION_ORDER` if `order` argument is not valid.
 *
 * @param {import("wgpu-matrix").Mat4} src - Matrix to extract rotation
 * @param {import("wgpu-matrix").Vec3} [dst] - Destination vector
 * @param {string} [order = "XYZ"] - Rotation order
 */
export function GetMat4Rotation(src, dst = vec3.create(), order = "XYZ")
{
    const edge = 1 - EPSILON;

    if (order === 'XYZ')
    {
        dst[1] = Math.asin(Clamp(src[8], -1));

        if (Math.abs(src[8]) < edge)
        {
            dst[0] = Math.atan2(-src[9], src[10]);
            dst[2] = Math.atan2(-src[4], src[ 0]);
        }
        else
        {
            dst[0] = Math.atan2(src[6], src[5]);
            dst[2] = 0;
        }
    }
    else if (order === 'XZY')
    {
        dst[2] = Math.asin(-Clamp(src[4], -1));

        if (Math.abs(src[4]) < edge)
        {
            dst[0] = Math.atan2(src[6], src[5]);
            dst[1] = Math.atan2(src[8], src[0]);
        }
        else
        {
            dst[0] = Math.atan2(-src[9], src[10]);
            dst[1] = 0;
        }
    }
    else if (order === 'YXZ')
    {
        dst[0] = Math.asin(-Clamp(src[9], -1));

        if (Math.abs(src[9]) < edge)
        {
            dst[1] = Math.atan2(src[8], src[10]);
            dst[2] = Math.atan2(src[1], src[ 5]);
        }
        else
        {
            dst[1] = Math.atan2(-src[2], src[0]);
            dst[2] = 0;
        }
    }
    else if (order === 'YZX')
    {
        dst[2] = Math.asin(Clamp(src[1], -1));

        if (Math.abs(src[1]) < edge)
        {
            dst[0] = Math.atan2(-src[9], src[5]);
            dst[1] = Math.atan2(-src[2], src[0]);
        }
        else
        {
            dst[0] = 0;
            dst[1] = Math.atan2(src[8], src[10]);
        }
    }
    else if (order === 'ZXY')
    {
        dst[0] = Math.asin(Clamp(src[6], -1));

        if (Math.abs(src[6]) < edge)
        {
            dst[1] = Math.atan2(-src[2], src[10]);
            dst[2] = Math.atan2(-src[4], src[ 5]);
        }
        else
        {
            dst[1] = 0;
            dst[2] = Math.atan2(src[1], src[0]);
        }
    }
    else if (order === 'ZYX')
    {
        dst[1] = Math.asin(-Clamp(src[2], -1));

        if (Math.abs(src[2]) < edge)
        {
            dst[0] = Math.atan2(src[6], src[10]);
            dst[2] = Math.atan2(src[1], src[ 0]);
        }
        else
        {
            dst[0] = 0;
            dst[2] = Math.atan2(-src[4], src[5]);
        }
    }
    else
    {
        ThrowWarning(ERROR.INVALID_ROTATION_ORDER, `"${order}" in \`GetMat4Rotation\` function.`);
    }

    return dst;
}

/**
 * Get maximum scale on a matrix axis.
 * Adapted from ogl's [getMaxScaleOnAxis](https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/Mat4Func.js#L524) function.
 *
 * @param {import("wgpu-matrix").Mat4} src - Matrix to extract scale
 */
export function GetMat4Scale(src)
{
    const [m11, m12, m13, m21, m22, m23, m31, m32, m33] = src;

    const x = m11 * m11 + m12 * m12 + m13 * m13;
    const y = m21 * m21 + m22 * m22 + m23 * m23;
    const z = m31 * m31 + m32 * m32 + m33 * m33;

    return Math.sqrt(Math.max(x, y, z));
}

/** @hidden */
export const EuclideanModulo = utils.euclideanModulo;
/** @hidden */
export const DegreesToRadians = utils.degToRad;
/** @hidden */
export const RadiansToDegrees = utils.radToDeg;
/** @hidden */
export const InverseLerp = utils.inverseLerp;
/** @hidden */
export const SetEpsilon = utils.setEpsilon;
/** @hidden */
export const EPSILON = utils.EPSILON;
/** @hidden */
export const Lerp = utils.lerp;

/** @hidden */
export const Quat = quat;
/** @hidden */
export const Mat3 = mat3;
/** @hidden */
export const Mat4 = mat4;

/** @hidden */
export const Vec2 = vec2;
/** @hidden */
export const Vec3 = vec3;
/** @hidden */
export const Vec4 = vec4;
