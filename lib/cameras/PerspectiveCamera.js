import { mat4 } from "wgpu-matrix";
import Camera from "#/cameras/Camera";
import { DegreesToRadians } from "#/utils";

export default class PerspectiveCamera extends Camera
{
    #View = mat4.identity();
    #ViewProjection = mat4.identity();

    /** @type {number} */ #Fov = 60;
    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;
    /** @type {number} */ #Aspect = innerWidth / innerHeight;

    /** @typedef {import("wgpu-matrix").Vec3Arg} Vec3 */
    /** @type {Vec3} */ #Up = new Float32Array([0, 1, 0]);
    /** @type {Vec3} */ #Position = new Float32Array([0, 0, 0]);

    /**
     * @param {number} [fov = 60] Typically, optimal values ​​range from 45 to 90 degrees.
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {LegacyRenderer | number} [rendererAspect = innerWidth / innerHeight]
     */
    constructor(fov = 60, near = 1, far = 1e3, rendererAspect = innerWidth / innerHeight)
    {
        super();

        this.#Fov = fov;
        this.#Near = near;
        this.#Far = far;
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;

        this.UpdateProjection();
    }

    UpdateProjection()
    {
        return mat4.perspective(DegreesToRadians(this.#Fov), this.#Aspect, this.#Near, this.#Far, this.Projection);
    }

    /** @param {boolean} [updateView = true] */
    UpdateViewProjection(updateView = true)
    {
        // "View Matrix" gets updated by default but sometimes this can be avoided for optimization purposes,
        // for example when calling this method right after `LookAt` which also updates the "View Matrix".
        updateView && mat4.inverse(this.Matrix, this.#ViewProjection);
        return mat4.multiply(this.Projection, this.#View, this.#ViewProjection);
    }

    /**
     * @param {Vec3} target
     * @param {Vec3} [up = [0, 1, 0]]
     */
    LookAt(target, up = this.#Up)
    {
        mat4.lookAt(this.Position, target, up, this.#View);
    }

    /** @param {Vec3} position */
    Translate(position)
    {
        mat4.translate(this.Matrix, position, this.Matrix);
    }

    /**
     * @param {Vec3} axis
     * @param {number} rotation
     */
    SetRotationAxis(axis, rotation)
    {
        mat4.rotation(axis, rotation, this.Matrix);
    }

    /**
     * @param {Vec3} axis
     * @param {number} rotation
     */
    RotateAxis(axis, rotation)
    {
        mat4.rotate(this.Matrix, axis, rotation, this.Matrix);
    }

    /** @param {number} rotation */
    RotateX(rotation)
    {
        mat4.rotateX(this.Matrix, rotation, this.Matrix);
    }

    /** @param {number} rotation */
    RotateY(rotation)
    {
        mat4.rotateY(this.Matrix, rotation, this.Matrix);
    }

    /** @param {number} rotation */
    RotateZ(rotation)
    {
        mat4.rotateZ(this.Matrix, rotation, this.Matrix);
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

    /** @param {LegacyRenderer | number} rendererAspect */
    set AspectRatio(rendererAspect)
    {
        this.#Aspect = typeof rendererAspect !== "number" ? rendererAspect.AspectRatio : rendererAspect;
        this.UpdateProjection();
    }

    get AspectRatio()
    {
        return this.#Aspect;
    }

    /** @param {Vec3} position */
    set Position(position)
    {
        mat4.setTranslation(this.Matrix, position, this.Matrix);
    }

    get Position()
    {
        return mat4.getTranslation(this.Matrix, this.#Position);
    }

    /** @param {number} rotation */
    set RotationX(rotation)
    {
        mat4.rotationX(rotation, this.Matrix);
    }

    /** @param {number} rotation */
    set RotationY(rotation)
    {
        mat4.rotationY(rotation, this.Matrix);
    }

    /** @param {number} rotation */
    set RotationZ(rotation)
    {
        mat4.rotationZ(rotation, this.Matrix);
    }
}
