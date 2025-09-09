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
