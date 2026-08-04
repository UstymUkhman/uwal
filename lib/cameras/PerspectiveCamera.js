/** @module PerspectiveCamera */

import { mat4 } from "wgpu-matrix";
import { Camera3D } from "./Camera3D";
import { DegreesToRadians } from "#/utils/Math";

/**
 * Camera manager class for scenes using perspective projection.
 * @see [Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.
 *
 * @noInheritDoc
 */
export class PerspectiveCamera extends Camera3D
{
    /** @type {number} */ #Fov = 60;
    /** @type {number} */ #Aspect = innerWidth / innerHeight;

    /**
     * @param {number} [fov = 60] - Field of view in degrees. Typically, optimal values range from `45` to `90` degrees.
     * @param {number} [near = 1] - Distance to the near plane.
     * @param {number} [far = 1000] - Distance to the far plane.
     * @param {Renderer | number} [rendererAspect = innerWidth / innerHeight] - Aspect ratio or a `Renderer` instance.
     */
    constructor(fov = 60, near = 1, far = 1e3, rendererAspect = innerWidth / innerHeight)
    {
        super(near, far, "PerspectiveCamera");

        this.#Fov = fov;
        this.AspectRatio = rendererAspect;
    }

    /**
     * @override
     * Compute the perspective projection and write the result into the corresponding uniform buffer if present.
     */
    UpdateProjectionMatrix()
    {
        const fovRadians = DegreesToRadians(this.#Fov);
        mat4.perspective(fovRadians, this.#Aspect, this.Near, this.Far, this.ProjectionMatrix);
        super.UpdateProjectionMatrix();
    }

    /**
     * @param {number} fov - Camera's field of view in degrees.
     */
    set FieldOfView(fov)
    {
        this.#Fov = fov;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Camera's field of view in degrees.
     */
    get FieldOfView()
    {
        return this.#Fov;
    }

    /**
     * @param {Renderer | number} rendererAspect - Camera's aspect ratio or a `Renderer` instance to extract it from.
     */
    set AspectRatio(rendererAspect)
    {
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns {number} Camera's aspect ratio. Defaults to `innerWidth / innerHeight`.
     */
    get AspectRatio()
    {
        return this.#Aspect;
    }
}
