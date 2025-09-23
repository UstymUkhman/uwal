/**
 * @typedef {import("wgpu-matrix").Vec3Arg} Vec3
 * @typedef {import("wgpu-matrix").Mat4Arg} Mat4
 * @typedef {Vec3 | undefined} Transformation
 * @exports Transformation
 */

import { vec3, mat4 } from "wgpu-matrix";
import { GetParamArray } from "#/utils";

export default class Node
{
    /** @type {Node[]} */ Children = [];
    /** @type {string | undefined} */ Label;
    /** @type {Node | null} */ #Parent = null;

    /** @type {string} */ RotationOrder = "XYZ";
    /** @type {string} */ TransformationOrder = "TRS";
    /** @type {Mat4} */ ProjectionMatrix = mat4.identity();

    /** @type {Mat4} */ #LocalMatrix = mat4.identity();
    /** @type {Mat4} */ #WorldMatrix = mat4.identity();

    /** @type {Vec3} */ #Scaling = vec3.set(1, 1, 1);
    /** @type {Vec3} */ #Position = vec3.create();
    /** @type {Vec3} */ #Rotation = vec3.create();

    /**
     * @param {string} [label]
     * @param {Node} [parent = null]
     */
    constructor(label, parent = null)
    {
        this.Label = label;
        this.Parent = parent;
    }

    /** @param {Node | Node[]} children */
    Add(children)
    {
        children = /** @type {Node[]} */ (GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /** @param {Node | Node[]} children */
    Remove(children)
    {
        children = /** @type {Node[]} */ (GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /**
     * @param {string} label
     * @returns {Node | null}
     */
    Find(label)
    {
        if (this.Label === label) return this;

        for (const c = 0, l = this.Children.length; c < l; c++)
        {
            const child = this.Children[c].Find(label);
            if (child) return child;
        }

        return null;
    }

    ResetLocalMatrix()
    {
        this.#LocalMatrix = mat4.identity();
    }

    UpdateWorldMatrix()
    {
        this.#UpdateLocalMatrix();

        !this.#Parent
            ? mat4.copy(this.#LocalMatrix, this.#WorldMatrix)
            : mat4.multiply(this.#Parent.WorldMatrix, this.#LocalMatrix, this.#WorldMatrix);

        this.Children.forEach(child => child.UpdateWorldMatrix());
    }

    #UpdateLocalMatrix()
    {
        const transformations = this.TransformationOrder.split("");

        for (let t = 0, tl = transformations.length; t < tl; t++)
            switch(transformations[t])
            {
                case "T":
                    mat4.translation(this.#Position, this.#LocalMatrix);
                break;

                case "R":
                    for (let o = 0, ol = this.RotationOrder.length; o < ol; ++o)
                    {
                        const order = this.RotationOrder[o];
                        const r = this.#Rotation[order.charCodeAt() - 88];
                        mat4[`rotate${order}`](this.#LocalMatrix, r, this.#LocalMatrix);
                    }
                break;

                case "S":
                    mat4.scale(this.#LocalMatrix, this.#Scaling, this.#LocalMatrix);
                break;
            }
    }

    /** @param {Mat4} cameraProjection */
    UpdateProjectionMatrix(cameraProjection)
    {
        const matrix = this.#Parent && this.#WorldMatrix || this.#LocalMatrix;
        return mat4.multiply(cameraProjection, matrix, this.ProjectionMatrix);
    }

    ResetProjectionMatrix()
    {
        this.ProjectionMatrix = mat4.identity();
    }

    /** @param {Vec3} translation */
    Translate(translation)
    {
        mat4.translate(this.#LocalMatrix, translation, this.#LocalMatrix);
    }

    /**
     * @param {Vec3} axis
     * @param {number} rotation
     */
    RotateAxis(axis, rotation)
    {
        mat4.rotate(this.#LocalMatrix, axis, rotation, this.#LocalMatrix);
    }

    /** @param {number} rotation */
    RotateX(rotation)
    {
        mat4.rotateX(this.#LocalMatrix, rotation, this.#LocalMatrix);
    }

    /** @param {number} rotation */
    RotateY(rotation)
    {
        mat4.rotateY(this.#LocalMatrix, rotation, this.#LocalMatrix);
    }

    /** @param {number} rotation */
    RotateZ(rotation)
    {
        mat4.rotateZ(this.#LocalMatrix, rotation, this.#LocalMatrix);
    }

    /** @param {Vec3} scaling */
    Scale(scaling)
    {
        mat4.scale(this.#LocalMatrix, scaling, this.#LocalMatrix);
    }

    /** @param {[Transformation, Transformation, Transformation]} transform */
    set Transform(transform)
    {
        const [position, rotation, scaling] = transform;
        const transformations = this.TransformationOrder.split("");

        for (let t = 0, tl = transformations.length; t < tl; t++)
            switch(transformations[t])
            {
                case "T":
                    if (position) this.Position = position;
                break;

                case "R":
                    if (rotation) this.Rotation = rotation;
                break;

                case "S":
                    if (scaling) this.Scaling = scaling;
                break;
            }
    }

    /** @param {Vec3} position */
    set Position(position)
    {
        vec3.copy(position, this.#Position);
        mat4.translation(position, this.#LocalMatrix);
    }

    get Position()
    {
        return this.#Position;
    }

    /** @param {Vec3} rotation */
    set Rotation(rotation)
    {
        vec3.copy(rotation, this.#Rotation);
        for (let o = 0, ol = this.RotationOrder.length; o < ol; ++o)
        {
            const order = this.RotationOrder[o];
            const r = rotation[order.charCodeAt() - 88];
            mat4[`rotate${order}`](this.#LocalMatrix, r, this.#LocalMatrix);
        }
    }

    get Rotation()
    {
        return this.#Rotation;
    }

    /** @param {Vec3} scaling */
    set Scaling(scaling)
    {
        vec3.copy(scaling, this.#Scaling);
        mat4.scale(this.#LocalMatrix, scaling, this.#LocalMatrix);
    }

    get Scaling()
    {
        return this.#Scaling;
    }

    get LocalMatrix()
    {
        return this.#LocalMatrix;
    }

    get WorldMatrix()
    {
        return this.#WorldMatrix;
    }

    /** @param {Node | null} parent */
    set Parent(parent)
    {
        if (this.#Parent)
        {
            const index = this.#Parent.Children.indexOf(this);
            0 <= index && this.#Parent.Children.splice(index, 1);
        }

        parent && parent.Children.push(this);
        this.#Parent = parent;
    }

    get Parent()
    {
        return this.#Parent;
    }
}
