import { mat3 } from "wgpu-matrix";
import { Node2D } from "#/primitives";

export default class Camera2D extends Node2D
{
    /** @type {number} */ #Top = 0;
    /** @type {number} */ #Right = innerWidth;
    /** @type {number} */ #Bottom = innerHeight;
    /** @type {number} */ #Left = 0;

    /** @type {Float32Array} */ #Frustum = new Float32Array(4);

    /**
     * @param {Renderer | number} [rendererRight = innerWidth]
     * @param {number} [bottom = innerHeight]
     */
    constructor(rendererRight = innerWidth, bottom = innerHeight)
    {
        super("Camera2D");

        this.Size = /** @type {number[]} */ (typeof rendererRight !== "number" &&
            rendererRight.CanvasSize || [rendererRight, bottom]
        );
    }

    /** @param {boolean} [normalize] */
    #UpdateFrustumPlanes(normalize = false)
    {}

    /** @override */
    UpdateProjectionMatrix()
    {
        const t = this.#Top, r = this.#Right, b = this.#Bottom, l = this.#Left;
        mat3.set(2 / r, 0, 0, 0, -2 / b, 0, l / r * 2 - 1, t / b * -2 + 1, 1, this.ProjectionMatrix);

        this.#UpdateFrustumPlanes();
        return this.ProjectionMatrix;
    }

    /** @param {number[]} size */
    set Size([right, bottom])
    {
        this.#Right = right;
        this.#Bottom = bottom;
        this.UpdateProjectionMatrix();
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

    get Frustum()
    {
        return this.#Frustum;
    }
}
