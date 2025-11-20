import { mat3, mat4, quat, vec2, vec3, vec4, utils } from "wgpu-matrix";

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
     * @description Sets this matrix to the transformation composed of the given position, rotation (Quaternion) and scale.
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
            (1 - (yy + zz)) * sx,
            (xy + wz) * sx,
            (xz - wy) * sx,
            0,
            (xy - wz) * sy,
            (1 - (xx + zz)) * sy,
            (yz + wx) * sy,
            0,
            (xz + wy) * sz,
            (yz - wx) * sz,
            (1 - (xx + yy)) * sz,
            0,
            position[0],
            position[1],
            position[2],
            1,
            dst
        );
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
