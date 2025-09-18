import { Node } from "#/primitives";
import MathUtils from "#/utils/Math";
import { vec3, mat4 } from "wgpu-matrix";

export default class PerspectiveCamera extends Node
{
    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */
    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);

    /** @type {number} */ #Fov = 60;
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Aspect = innerWidth / innerHeight;

    /** @type {Float32Array} */ #ViewMatrix = mat4.identity();
    /** @type {Float32Array} */ #ProjectionMatrix = mat4.identity();
    /** @type {Float32Array} */ #ViewProjectionMatrix = mat4.identity();

    /**
     * @param {number} [fov = 60] Typically, optimal values ​​range from 45 to 90 degrees.
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {Renderer | number} [rendererAspect = innerWidth / innerHeight]
     */
    constructor(fov = 60, near = 1, far = 1e3, rendererAspect = innerWidth / innerHeight)
    {
        super();

        this.#Fov = fov;
        this.#Near = near;
        this.#Far = far;
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;

        this.UpdateProjectionMatrix();
    }

    /**
     * @param {boolean} [updateViewMatrix = true] - View matrix is updated by default, but sometimes this can be avoided
     * for optimization purposes, like when calling this method right after `LookAt`, which also updates the view matrix.
     */
    UpdateViewProjectionMatrix(updateViewMatrix = true)
    {
        updateViewMatrix && mat4.inverse(this.LocalMatrix, this.#ViewMatrix);
        return mat4.multiply(this.#ProjectionMatrix, this.#ViewMatrix, this.#ViewProjectionMatrix);
    }

    UpdateProjectionMatrix()
    {
        const fovRadians = MathUtils.DegreesToRadians(this.#Fov);
        return mat4.perspective(fovRadians, this.#Aspect, this.#Near, this.#Far, this.#ProjectionMatrix);
    }

    ResetProjectionMatrix()
    {
        this.#ProjectionMatrix = mat4.identity();
    }

    /**
     * @param {Vec3} target
     * @param {Vec3} [up = [0, 1, 0]]
     */
    LookAt(target, up = this.#Up)
    {
        mat4.lookAt(this.Position, target, up, this.#ViewMatrix);
    }

    get ProjectionMatrix()
    {
        return this.#ProjectionMatrix;
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

    /** @param {number} near */
    set Near(near)
    {
        this.#Near = near;
        this.UpdateProjectionMatrix();
    }

    get Near()
    {
        return this.#Near;
    }

    /** @param {number} far */
    set Far(far)
    {
        this.#Far = far;
        this.UpdateProjectionMatrix();
    }

    get Far()
    {
        return this.#Far;
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
