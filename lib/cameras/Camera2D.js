import { mat3 } from "wgpu-matrix";
import { Node2D } from "#/primitives";

export default class Camera2D extends Node2D
{
    /** @type {string} */ #Label = "Camera2D";
    /** @type {number} */ #Width = innerWidth;
    /** @type {number} */ #Height = innerHeight;

    /**
     * @param {Renderer | number} [rendererWidth = innerWidth]
     * @param {number} [height = innerHeight]
     */
    constructor(rendererWidth = innerWidth, height = innerHeight)
    {
        super("Camera2D");

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

        this.UpdateProjectionMatrix();
    }

    /** @override */
    UpdateProjectionMatrix()
    {
        return mat3.set(2 / this.#Width, 0, 0, 0, -2 / this.#Height, 0, -1, 1, 1, this.ProjectionMatrix);
    }

    /** @param {number} width */
    set Width(width)
    {
        this.#Width = width;
        this.UpdateProjectionMatrix();
    }

    get Width()
    {
        return this.#Width;
    }

    /** @param {number} height */
    set Height(height)
    {
        this.#Height = height;
        this.UpdateProjectionMatrix();
    }

    get Height()
    {
        return this.#Height;
    }
}
