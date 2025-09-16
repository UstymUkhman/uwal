import { vec3, mat4 } from "wgpu-matrix";

export default class Transform
{
    /**
     * @typedef {import("wgpu-matrix").Vec3Arg} Vec3
     * @typedef {import("wgpu-matrix").Mat4Arg} Mat4
     */

    /** @type {Vec3} */ #Translation = vec3.create();
    /** @type {Vec3} */ #Rotation = vec3.create();
    /** @type {Vec3} */ #Scale = vec3.create();

    /** @type {string} */ #RotationOrder = "XYZ";

    constructor(translation = vec3.zero(), rotation = vec3.zero(), scale = vec3.set(1, 1, 1))
    {
        vec3.copy(translation, this.#Translation);
        vec3.copy(rotation, this.#Rotation);
        vec3.copy(scale, this.#Scale);
    }

    /**
     * @param {Mat4} dst
     * @param {string} [order = "XYZ"]
     */
    #Rotate(dst, order = this.#RotationOrder)
    {
        for (let o = 0; o < order.length; ++o)
        {
            const r = this.#Rotation[order[o].charCodeAt() - 88];
            mat4[`rotate${order[o]}`](dst, r, dst);
        }
    }

    /** @param {Mat4} dst */
    GetMatrix(dst)
    {
        mat4.translation(this.#Translation, dst);
        this.#Rotate(dst);
        mat4.scale(dst, this.#Scale, dst);

        return dst;
    }

    /** @param {Vec3} translation */
    set Translation(translation)
    {
        vec3.copy(translation, this.#Translation);
    }

    get Translation()
    {
        return this.#Translation;
    }

    /** @param {Vec3} rotation */
    set Rotation(rotation)
    {
        vec3.copy(rotation, this.#Rotation);
    }

    get Rotation()
    {
        return this.#Rotation;
    }

    /** @param {Vec3} scale */
    set Scale(scale)
    {
        vec3.copy(scale, this.#Scale);
    }

    get Scale()
    {
        return this.#Scale;
    }
}
