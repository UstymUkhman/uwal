import { mat3 } from "wgpu-matrix";
import Camera from "#/cameras/Camera";

export default class Camera2D extends Camera
{
    /** @type {number} */ #Width = innerWidth;
    /** @type {number} */ #Height = innerHeight;

    /** @override @protected */ Matrix = mat3.identity();
    /** @override @protected */ Projection = mat3.identity();

    /**
     * @param {Renderer | number} [rendererWidth = innerWidth]
     * @param {number} [height = innerHeight]
     */
    constructor(rendererWidth = innerWidth, height = innerHeight)
    {
        super();

        if (typeof rendererWidth !== "number")
        {
            const [width, height] = rendererWidth.CanvasSize;
            this.#Width = width; this.#Height = height;
        }
        else
        {
            this.#Width = rendererWidth;
            this.#Height = height;
        }

        this.UpdateProjection();
    }

    UpdateProjection()
    {
        mat3.set(2 / this.#Width, 0, 0, 0, -2 / this.#Height, 0, -1, 1, 1, this.Projection);
        return this.Projection;
    }

    /** @param {number} width */
    set Width(width)
    {
        this.#Width = width;
        this.UpdateProjection();
    }

    get Width()
    {
        return this.#Width;
    }

    /** @param {number} height */
    set Height(height)
    {
        this.#Height = height;
        this.UpdateProjection();
    }

    get Height()
    {
        return this.#Height;
    }
}
