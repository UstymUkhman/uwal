import { Node } from "#/primitives";
import { MathUtils } from "#/utils";
import { vec3, mat4 } from "wgpu-matrix";

export default class Camera3D extends Node
{
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;

    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {Float32Array} */ #ViewMatrix = mat4.identity();
    /** @type {Float32Array} */ #Frustum = new Float32Array(24);
    /** @type {Float32Array} */ #ViewProjectionMatrix = mat4.identity();

    /**
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {string} [label]
     */
    constructor(near = 1, far = 1e3, label)
    {
        super(label);

        this.#Near = near;
        this.#Far = far;
    }

    /** @see {@link https://www8.cs.umu.se/kurser/5DV051/HT12/lab/plane_extraction.pdf} */
    #UpdateFrustumPlanes()
    {
        const [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ] = this.#ViewProjectionMatrix;

        // Left Plane:
        this.#Frustum[ 0] = m03 - m00;
        this.#Frustum[ 1] = m13 - m10;
        this.#Frustum[ 2] = m23 - m20;
        this.#Frustum[ 3] = m33 - m30;

        // Right Plane:
        this.#Frustum[ 4] = m03 + m00;
        this.#Frustum[ 5] = m13 + m10;
        this.#Frustum[ 6] = m23 + m20;
        this.#Frustum[ 7] = m33 + m30;

        // Top Plane:
        this.#Frustum[ 8] = m03 + m01;
        this.#Frustum[ 9] = m13 + m11;
        this.#Frustum[10] = m23 + m21;
        this.#Frustum[11] = m33 + m31;

        // Bottom Plane:
        this.#Frustum[12] = m03 - m01;
        this.#Frustum[13] = m13 - m11;
        this.#Frustum[14] = m23 - m21;
        this.#Frustum[15] = m33 - m31;

        // Far Plane:
        this.#Frustum[16] = m03 - m02;
        this.#Frustum[17] = m13 - m12;
        this.#Frustum[18] = m23 - m22;
        this.#Frustum[19] = m33 - m32;

        // Near Plane:
        this.#Frustum[20] = m03 + m02;
        this.#Frustum[21] = m13 + m12;
        this.#Frustum[22] = m23 + m22;
        this.#Frustum[23] = m33 + m32;

        // Normalize all planes distances:
        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
        {
            const length = Math.hypot(
                this.#Frustum[p + 0],
                this.#Frustum[p + 1],
                this.#Frustum[p + 2]
            ) || 1;

            this.#Frustum[p + 0] /= length;
            this.#Frustum[p + 1] /= length;
            this.#Frustum[p + 2] /= length;
            this.#Frustum[p + 3] /= length;
        }

        return this.#Frustum;
    }

    UpdateViewProjectionMatrix()
    {
        mat4.inverse(this.LocalMatrix, this.#ViewMatrix);
        mat4.multiply(this.ProjectionMatrix, this.#ViewMatrix, this.#ViewProjectionMatrix);

        this.#UpdateFrustumPlanes();
        return this.#ViewProjectionMatrix;
    }

    /**
     * @param {Vec3} target
     * @param {Vec3} [up = [0, 1, 0]]
     */
    LookAt(target, up = this.#Up)
    {
        mat4.lookAt(this.Position, target, up, this.#ViewMatrix);
        return mat4.multiply(this.ProjectionMatrix, this.#ViewMatrix, this.#ViewProjectionMatrix);
    }

    /** @param {import("../primitives").Mesh} Mesh */
    Contains(Mesh)
    {
        const f = this.#Frustum, { Geometry, WorldMatrix: m } = Mesh;
        const radius = MathUtils.GetMaxAxisScale(m) * Geometry.Radius;

        // Bounding Sphere Test:
        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
            if ((f[p] * m[12] + f[p + 1] * m[13] + f[p + 2] * m[14] + f[p + 3]) < -radius)
                return false;

        // Bounding Box Test:
        const { Min, Max } = Mesh.UpdateBoundingBox();

        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
        {
            const x = f[p], y = f[p + 1], z = f[p + 2];

            const bbx = x < 0 ? Min[0] : Max[0];
            const bby = y < 0 ? Min[1] : Max[1];
            const bbz = z < 0 ? Min[2] : Max[2];

            if (x * bbx + y * bby + z * bbz + f[p + 3] < 0)
                return false;
        }

        return true;
    }

    /** @override */
    UpdateProjectionMatrix()
    {
        return this.ProjectionMatrix;
    }

    get ViewProjectionMatrix()
    {
        return this.#ViewProjectionMatrix;
    }

    /** @param {number} near */
    set Near(near)
    {
        this.#Near = near;
        this.UpdateProjectionMatrix();
    }

    get Near()
    {
        return this.#Near;
    }

    /** @param {number} far */
    set Far(far)
    {
        this.#Far = far;
        this.UpdateProjectionMatrix();
    }

    get Far()
    {
        return this.#Far;
    }
}
