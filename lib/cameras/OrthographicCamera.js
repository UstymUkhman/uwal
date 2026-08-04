/** @module OrthographicCamera */

import { mat4 } from "wgpu-matrix";
import { Camera3D } from "./Camera3D";

/**
 * Camera manager class for scenes using orthographic projection.
 * @see [Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.
 *
 * @noInheritDoc
 */
export class OrthographicCamera extends Camera3D
{
    /** @type {number} */ #Top = 0;
    /** @type {number} */ #Right = innerWidth;
    /** @type {number} */ #Bottom = innerHeight;
    /** @type {number} */ #Left = 0;

    /**
     * @param {number} [near = 1] - Distance to the near plane.
     * @param {number} [far = 1000] - Distance to the far plane.
     * @param {number} [top = 0] - Distance to the top plane.
     * @param {Renderer | number} [rendererRight = innerWidth] - Distance to the right plane or a `Renderer` instance.
     * @param {number} [bottom = innerHeight] - Distance to the bottom plane, optional when called with a `Renderer` instance.
     * @param {number} [left = 0] - Distance to the left plane.
     */
    constructor(near = 1, far = 1e3, top = 0, rendererRight = innerWidth, bottom = innerHeight, left = 0)
    {
        super(near, far, "OrthographicCamera");

        this.#Top = top;
        this.#Left = left;

        if (typeof rendererRight !== "number")
        {
            const [width, height] = rendererRight.CanvasSize;
            this.#Right = width;
            this.#Bottom = height;
        }
        else
        {
            this.#Right = rendererRight;
            this.#Bottom = bottom;
        }

        this.UpdateProjectionMatrix();
    }

    /**
     * @override
     * Compute the orthographic projection and write the result into the corresponding uniform buffer if present.
     */
    UpdateProjectionMatrix()
    {
        mat4.ortho(this.#Left, this.#Right, this.#Bottom, this.#Top, this.Near, this.Far, this.ProjectionMatrix);
        super.UpdateProjectionMatrix();
    }

    /**
     * @param {number} top - Distance to the top plane.
     */
    set Top(top)
    {
        this.#Top = top;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Distance to the top plane of the frustum.
     */
    get Top()
    {
        return this.#Top;
    }

    /**
     * @param {number} right - Distance to the right plane.
     */
    set Right(right)
    {
        this.#Right = right;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Distance to the right plane of the frustum.
     */
    get Right()
    {
        return this.#Right;
    }

    /**
     * @param {number} bottom - Distance to the bottom plane.
     */
    set Bottom(bottom)
    {
        this.#Bottom = bottom;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Distance to the bottom plane of the frustum.
     */
    get Bottom()
    {
        return this.#Bottom;
    }

    /**
     * @param {number} left - Distance to the left plane.
     */
    set Left(left)
    {
        this.#Left = left;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Distance to the left plane of the frustum.
     */
    get Left()
    {
        return this.#Left;
    }
}
