import { mat4 } from "wgpu-matrix";
import Camera from "#/cameras/Camera";
import { DegreesToRadians } from "#/utils";

export default class PerspectiveCamera extends Camera
{
    #View = mat4.identity();
    #Projection = mat4.identity();

    /** @type {number} */ #Fov = 60;
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Aspect = 2;

    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */

    /**
     * @param {number} [fov = 60] Typically, optimal values ​​range from 45 to 90 degrees.
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {Renderer | number} [rendererAspect = 2]
     */
    constructor(fov = 60, near = 1, far = 1e3, rendererAspect = 2)
    {
        super();
        this.#Fov = fov; this.#Near = near; this.#Far = far;
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;
        this.UpdateProjection();
    }

    UpdateProjection()
    {
        mat4.perspective(DegreesToRadians(this.#Fov), this.#Aspect, this.#Near, this.#Far, this.#Projection);
        return this.#Projection;
    }

    /** @param {Vec3} translation */
    Translate(translation)
    {
        mat4.translate(this.Matrix, translation, this.Matrix);
    }

    /** @param {number} rotation */
    RotationY(rotation)
    {
        mat4.rotationY(rotation, this.Matrix);
    }

    /** @param {number} fov */
    set FieldOfView(fov)
    {
        this.#Fov = fov;
        this.UpdateProjection();
    }

    get FieldOfView()
    {
        return this.#Fov;
    }

    /** @param {number} near */
    set Near(near)
    {
        this.#Near = near;
        this.UpdateProjection();
    }

    get Near()
    {
        return this.#Fov;
    }

    /** @param {number} far */
    set Far(far)
    {
        this.Far = far;
        this.UpdateProjection();
    }

    get Far()
    {
        return this.#Far;
    }

    /** @param {number} aspect */
    set AspectRatio(aspect)
    {
        this.#Aspect = aspect;
        this.UpdateProjection();
    }

    get AspectRatio()
    {
        return this.#Aspect;
    }

    get Projection()
    {
        return this.#Projection;
    }

    get ViewMatrix()
    {
        return mat4.inverse(this.Matrix, this.#View);
    }

    get ViewProjectionMatrix()
    {
        return mat4.multiply(this.#Projection, this.ViewMatrix);
    }
}
