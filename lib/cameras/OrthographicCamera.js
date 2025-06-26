import Camera from "#/cameras/Camera";

export default class OrthographicCamera extends Camera
{
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Top = 0;
    /** @type {number} */ #Right = innerWidth;
    /** @type {number} */ #Bottom = innerHeight;
    /** @type {number} */ #Left = 0;

    /**
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {number} [top = 0]
     * @param {number} [rendererRight = innerWidth]
     * @param {number} [bottom = innerHeight]
     * @param {number} [left = 0]
     */
    constructor(near = 1, far = 1e3, top = 0, rendererRight = innerWidth, bottom = innerHeight, left = 0)
    {
        super();

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

        this.UpdateProjection();
    }

    UpdateProjection()
    {
        mat4.ortho(this.#Left, this.#Right, this.#Bottom, this.#Top, this.#Near, this.#Far, this.Projection);
        return this.Projection;
    }

    /** @param {number} near */
    set Near(near)
    {
        this.#Near = near;
        this.UpdateProjection();
    }

    get Near()
    {
        return this.#Near;
    }

    /** @param {number} far */
    set Far(far)
    {
        this.#Far = far;
        this.UpdateProjection();
    }

    get Far()
    {
        return this.#Far;
    }

    /** @param {number} top */
    set Top(top)
    {
        this.#Top = top;
        this.UpdateProjection();
    }

    get Top()
    {
        return this.#Top;
    }

    /** @param {number} right */
    set Right(right)
    {
        this.#Right = right;
        this.UpdateProjection();
    }

    get Right()
    {
        return this.#Right;
    }

    /** @param {number} bottom */
    set Bottom(bottom)
    {
        this.#Bottom = bottom;
        this.UpdateProjection();
    }

    get Bottom()
    {
        return this.#Bottom;
    }

    /** @param {number} left */
    set Left(left)
    {
        this.#Left = left;
        this.UpdateProjection();
    }

    get Left()
    {
        return this.#Left;
    }
}
