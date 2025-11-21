import Camera3D from "./Camera3D";
import { mat4 } from "wgpu-matrix";

export default class OrthographicCamera extends Camera3D
{
    /** @type {number} */ #Top = 0;
    /** @type {number} */ #Right = innerWidth;
    /** @type {number} */ #Bottom = innerHeight;
    /** @type {number} */ #Left = 0;

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

    /** @override */
    UpdateProjectionMatrix()
    {
        return mat4.ortho(
            this.#Left, this.#Right, this.#Bottom, this.#Top, this.Near, this.Far, this.ProjectionMatrix
        );
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
