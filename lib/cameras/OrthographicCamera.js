import { mat4 } from "wgpu-matrix";
import { Node } from "#/primitives";

export default class OrthographicCamera extends Node
{
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Top = 0;
    /** @type {number} */ #Right = innerWidth;
    /** @type {number} */ #Bottom = innerHeight;
    /** @type {number} */ #Left = 0;

    /** @type {Float32Array} */ #Frustum = new Float32Array(24);

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
        ] = this.ProjectionMatrix;

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

    /** @override */
    UpdateProjectionMatrix()
    {
        return mat4.ortho(
            this.#Left, this.#Right, this.#Bottom, this.#Top, this.#Near, this.#Far, this.ProjectionMatrix
        );
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
