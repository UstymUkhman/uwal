import { Node } from "#/primitives";
import { vec3, mat4 } from "wgpu-matrix";

export default class OrthographicCamera extends Node
{
    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Top = 0;
    /** @type {number} */ #Right = innerWidth;
    /** @type {number} */ #Bottom = innerHeight;
    /** @type {number} */ #Left = 0;

    /** @type {Float32Array} */ #ViewMatrix = mat4.identity();
    /** @type {Float32Array} */ #Frustum = new Float32Array(24);
    /** @type {Float32Array} */ #ViewProjectionMatrix = mat4.identity();

    /**
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {number} [top = 0]
     * @param {Renderer | number} [rendererRight = innerWidth]
     * @param {number} [bottom = innerHeight]
     * @param {number} [left = 0]
     */
    constructor(near = 1, far = 1e3, top = 0, rendererRight = innerWidth, bottom = innerHeight, left = 0)
    {
        super("OrthographicCamera");

        this.#Near = near;
        this.#Far = far;
        this.#Top = top;
        this.#Left = left;

        if (typeof rendererRight !== "number")
        {
            const [width, height] = rendererRight.CanvasSize;
            this.#Right = width; this.#Bottom = height;
        }
        else
        {
            this.#Right = rendererRight;
            this.#Bottom = bottom;
        }

        this.UpdateProjectionMatrix();
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

    /** @override */
    UpdateProjectionMatrix()
    {
        return mat4.ortho(
            this.#Left, this.#Right, this.#Bottom, this.#Top, this.#Near, this.#Far, this.ProjectionMatrix
        );
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
        const f = this.#Frustum,
              { Radius, WorldMatrix: m } = Mesh;

        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
            if ((f[p] * m[12] + f[p + 1] * m[13] + f[p + 2] * m[14] + f[p + 3]) < -Radius)
                return false;

        return true;
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

    /** @param {number} top */
    set Top(top)
    {
        this.#Top = top;
        this.UpdateProjectionMatrix();
    }

    get Top()
    {
        return this.#Top;
    }

    /** @param {number} right */
    set Right(right)
    {
        this.#Right = right;
        this.UpdateProjectionMatrix();
    }

    get Right()
    {
        return this.#Right;
    }

    /** @param {number} bottom */
    set Bottom(bottom)
    {
        this.#Bottom = bottom;
        this.UpdateProjectionMatrix();
    }

    get Bottom()
    {
        return this.#Bottom;
    }

    /** @param {number} left */
    set Left(left)
    {
        this.#Left = left;
        this.UpdateProjectionMatrix();
    }

    get Left()
    {
        return this.#Left;
    }
}
