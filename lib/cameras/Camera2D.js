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

        this.Size = typeof rendererWidth !== "number"
            && this.rendererWidth.CanvasSize
            || [rendererWidth, height];
    }

    /** @override */
    UpdateProjectionMatrix()
    {
        return mat3.set(2 / this.#Width, 0, 0, 0, -2 / this.#Height, 0, -1, 1, 1, this.ProjectionMatrix);
    }

    /** @param {number[]} size */
    set Size([width, height])
    {
        this.#Width = width; this.#Height = height;
        this.UpdateProjectionMatrix();
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
