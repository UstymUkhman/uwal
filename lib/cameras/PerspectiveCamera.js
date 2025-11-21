import Camera3D from "./Camera3D";
import { mat4 } from "wgpu-matrix";
import MathUtils from "#/utils/Math";

export default class PerspectiveCamera extends Camera3D
{
    /** @type {number} */ #Fov = 60;
    /** @type {number} */ #Aspect = innerWidth / innerHeight;

    /**
     * @param {number} [fov = 60] Typically, optimal values ​​range from 45 to 90 degrees.
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {Renderer | number} [rendererAspect = innerWidth / innerHeight]
     */
    constructor(fov = 60, near = 1, far = 1e3, rendererAspect = innerWidth / innerHeight)
    {
        super(near, far, "PerspectiveCamera");

        this.#Fov = fov;
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;

        this.UpdateProjectionMatrix();
    }

    /** @override */
    UpdateProjectionMatrix()
    {
        const fovRadians = MathUtils.DegreesToRadians(this.#Fov);
        return mat4.perspective(fovRadians, this.#Aspect, this.Near, this.Far, this.ProjectionMatrix);
    }

    /** @param {number} fov */
    set FieldOfView(fov)
    {
        this.#Fov = fov;
        this.UpdateProjectionMatrix();
    }

    get FieldOfView()
    {
        return this.#Fov;
    }

    /** @param {Renderer | number} rendererAspect */
    set AspectRatio(rendererAspect)
    {
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;
        this.UpdateProjectionMatrix();
    }

    get AspectRatio()
    {
        return this.#Aspect;
    }
}
