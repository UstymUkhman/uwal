import { Node } from "#/primitives";
import MathUtils from "#/utils/Math";
import { vec3, mat4 } from "wgpu-matrix";

export default class PerspectiveCamera extends Node
{
    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {number} */ #Fov = 60;
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Aspect = innerWidth / innerHeight;

    /** @type {Float32Array} */ #Frustum = new Float32Array(24);
    /** @type {Float32Array} */ #ModelViewMatrix = mat4.identity();
    /** @type {Float32Array} */ #ViewProjectionMatrix = mat4.identity();

    /**
     * @param {number} [fov = 60] Typically, optimal values ​​range from 45 to 90 degrees.
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {Renderer | number} [rendererAspect = innerWidth / innerHeight]
     */
    constructor(fov = 60, near = 1, far = 1e3, rendererAspect = innerWidth / innerHeight)
    {
        super("PerspectiveCamera");

        this.#Fov = fov;
        this.#Near = near;
        this.#Far = far;
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;

        this.UpdateProjectionMatrix();
    }

    /**
     * @param {boolean} [normalize]
     * @see {@link https://www8.cs.umu.se/kurser/5DV051/HT12/lab/plane_extraction.pdf}
     */
    UpdateFrustumPlanes(normalize = false)
    {
        const [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ] = this.#ViewProjectionMatrix;

        // Near Plane:
        this.#Frustum[ 0] = m30 + m20;
        this.#Frustum[ 1] = m31 + m21;
        this.#Frustum[ 2] = m32 + m22;
        this.#Frustum[ 3] = m33 + m23;

        // Far Plane:
        this.#Frustum[ 4] = m30 - m20;
        this.#Frustum[ 5] = m31 - m21;
        this.#Frustum[ 6] = m32 - m22;
        this.#Frustum[ 7] = m33 - m23;

        // Top Plane:
        this.#Frustum[ 8] = m30 - m10;
        this.#Frustum[ 9] = m31 - m11;
        this.#Frustum[10] = m32 - m12;
        this.#Frustum[11] = m33 - m13;

        // Right Plane:
        this.#Frustum[12] = m30 - m00;
        this.#Frustum[13] = m31 - m01;
        this.#Frustum[14] = m32 - m02;
        this.#Frustum[15] = m33 - m03;

        // Bottom Plane:
        this.#Frustum[16] = m30 + m10;
        this.#Frustum[17] = m31 + m11;
        this.#Frustum[18] = m32 + m12;
        this.#Frustum[19] = m33 + m13;

        // Left Plane:
        this.#Frustum[20] = m30 + m00;
        this.#Frustum[21] = m31 + m01;
        this.#Frustum[22] = m32 + m02;
        this.#Frustum[23] = m33 + m03;

        if (!normalize) return this.#Frustum;

        for (let p = 0; p < 6; ++p)
        {
            const plane = p * 4;

            const length = Math.hypot(
                this.#Frustum[plane + 0],
                this.#Frustum[plane + 1],
                this.#Frustum[plane + 2]
            ) || 1;

            this.#Frustum[plane + 0] /= length;
            this.#Frustum[plane + 1] /= length;
            this.#Frustum[plane + 2] /= length;
            this.#Frustum[plane + 3] /= length;
        }

        return this.#Frustum;
    }

    /**
     * @param {boolean} [updateModelView = true] - Model view matrix is updated by default, but sometimes this can be avoided
     * for optimization purposes, like when calling this method right after `LookAt`, which also updates the view matrix.
     */
    UpdateViewProjectionMatrix(updateModelView = true)
    {
        updateModelView && mat4.inverse(this.LocalMatrix, this.#ModelViewMatrix);
        return mat4.multiply(this.ProjectionMatrix, this.#ModelViewMatrix, this.#ViewProjectionMatrix);
    }

    /** @override */
    UpdateProjectionMatrix()
    {
        const fovRadians = MathUtils.DegreesToRadians(this.#Fov);
        return mat4.perspective(fovRadians, this.#Aspect, this.#Near, this.#Far, this.ProjectionMatrix);
    }

    /**
     * @param {Vec3} target
     * @param {Vec3} [up = [0, 1, 0]]
     */
    LookAt(target, up = this.#Up)
    {
        mat4.lookAt(this.Position, target, up, this.#ModelViewMatrix);
    }

    get ViewProjectionMatrix()
    {
        return this.#ViewProjectionMatrix;
    }

    /** @param {number} fov */
    set FieldOfView(fov)
    {
        this.#Fov = fov;
        this.UpdateProjectionMatrix();
    }

    get FieldOfView()
    {
        return this.#Fov;
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

    /** @param {Renderer | number} rendererAspect */
    set AspectRatio(rendererAspect)
    {
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;
        this.UpdateProjectionMatrix();
    }

    get AspectRatio()
    {
        return this.#Aspect;
    }
}
