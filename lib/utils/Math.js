import { mat3, mat4, quat, vec2, vec3, vec4, utils } from "wgpu-matrix";
import { ERROR, ThrowWarning } from "#/Errors";

const vec = /*@__PURE__*/ vec3.create();

export default
{
    /**
     * @param {number} value
     * @param {number} [min = 0]
     * @param {number} [max = 1]
     */
    Clamp: (value, min = 0, max = 1) => Math.max(min, Math.min(value, max)),

    /**
     * @param {number} min
     * @param {number} max
     */
    RandomInt: (min, max) => (Math.random() * (max - min + 1) | 0) + min,

    /**
     * @param {number} [min = 0]
     * @param {number} [max = 1]
     */
    Random: (min = 0, max = 1) => Math.random() * (max - min) + min,

    /**
     * @description Get matrix rotation as an Euler vector assuming the upper 3x3 matrix is a pure rotation matrix.
     * @see {@link https://github.com/oframe/ogl/blob/385ce65c352c70734a36dc98c787fdd1d30ddb3b/src/math/functions/EulerFunc.js}
     *
     * @param {import("wgpu-matrix").Mat4} src
     * @param {import("wgpu-matrix").Vec3} [dst]
     * @param {string} [order = "XYZ"]
     */
    GetMat4Rotation(src, dst = vec3.create(), order = "XYZ")
    {
        const edge = 1 - this.EPSILON;

        if (order === 'XYZ')
        {
            dst[1] = Math.asin(this.Clamp(src[8], -1));

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
            dst[2] = Math.asin(-this.Clamp(src[4], -1));

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
            dst[0] = Math.asin(-this.Clamp(src[9], -1));

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
            dst[2] = Math.asin(this.Clamp(src[1], -1));

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
            dst[0] = Math.asin(this.Clamp(src[6], -1));

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
            dst[1] = Math.asin(-this.Clamp(src[2], -1));

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
            ThrowWarning(ERROR.INVALID_ROTATION_ORDER, `"${order}" in \`MathUtils.GetEulerFromMat4\` method.`);
        }

        return dst;
    },

    /**
     * @description Copy matrix rotation component into the given 4x4 matrix.
     * @see {@link https://github.com/mrdoob/three.js/blob/e61ab90bd7b03dd9956d170476966ca7d9f7af46/src/math/Matrix4.js#L285}
     *
     * @param {import("wgpu-matrix").Mat4} src
     * @param {import("wgpu-matrix").Mat4} [dst]
     */
    CopyMat4Rotation(src, dst = mat4.identity())
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
    },

    /**
     * @description Set this matrix to the transformation composed of the given position, rotation (Quaternion) and scale.
     * @see {@link https://github.com/mrdoob/three.js/blob/2df1da20673ac2fb366ae980bab178abc03bf2cd/src/math/Matrix4.js#L976}
     *
     * @param {import("wgpu-matrix").Vec3} position
     * @param {import("wgpu-matrix").Quat} rotation
     * @param {import("wgpu-matrix").Vec3} scale
     * @param {import("wgpu-matrix").Mat4} [dst]
     */
    ComposeMat4(position, rotation, scale, dst)
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
    },

    /**
     * @description Get maximum scale on a matrix axis.
     * @see {@link https://github.com/oframe/ogl/blob/master/src/math/functions/Mat4Func.js#L524-L540}
     *
     * @param {import("wgpu-matrix").Mat4} src
     */
    GetMaxAxisScale(src)
    {
        const [m11, m12, m13, m21, m22, m23, m31, m32, m33] = src;

        const x = m11 * m11 + m12 * m12 + m13 * m13;
        const y = m21 * m21 + m22 * m22 + m23 * m23;
        const z = m31 * m31 + m32 * m32 + m33 * m33;

        return Math.sqrt(Math.max(x, y, z));
    },

    /**
     * @param {number} value
     * @param {number} [min = 0]
     * @param {number} [max = 1]
     */
    SmootherStep(value, min = 0, max = 1)
    {
        if (value <= min) return 0;
        if (value >= max) return 1;

        value = (value - min) / (max - min);
        return value * value * value * (value * (value * 6 - 15) + 10);
    },

    /**
     * @param {number} value
     * @param {number} [min = 0]
     * @param {number} [max = 1]
     */
    SmoothStep(value, min = 0, max = 1)
    {
        if (value <= min) return 0;
        if (value >= max) return 1;

        value = (value - min) / (max - min);
        return value * value * (3 - 2 * value);
    },

    EuclideanModulo: utils.euclideanModulo,
    DegreesToRadians: utils.degToRad,
    RadiansToDegrees: utils.radToDeg,
    InverseLerp: utils.inverseLerp,
    SetEpsilon: utils.setEpsilon,
    EPSILON: utils.EPSILON,
    Lerp: utils.lerp,

    PHI: Math.sqrt(5) * 0.5 + 0.5,
    DELTA_UPDATE: 1 / 0.06,
    DELTA_FRAME: 1 / 60,
    RAD: Math.PI / 180,
    DEG: 180 / Math.PI,
    HPI: Math.PI / 2,
    TAU: Math.PI * 2,

    Mat3: mat3,
    Mat4: mat4,
    Quat: quat,
    Vec2: vec2,
    Vec3: vec3,
    Vec4: vec4
};
