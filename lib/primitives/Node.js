import { vec3, mat4 } from "wgpu-matrix";
import { GetParamArray } from "#/utils";

export default class Node
{
    /** @type {string} */ Label;
    /** @type {Node[]} */ Children = [];
    /** @type {Node | null} */ #Parent = null;
    /** @type {string} */ RotationOrder = "XYZ";
    /** @type {string} */ TransformationOrder = "TRS";

    /**
     * @typedef {import("wgpu-matrix").Vec3Arg} Vec3
     * @typedef {import("wgpu-matrix").Mat4Arg} Mat4
     */

    /** @type {Mat4} */ #LocalMatrix = mat4.identity();
    /** @type {Mat4} */ #WorldMatrix = mat4.identity();

    /** @type {Vec3} */ #Scale = vec3.set(1, 1, 1);
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
                    mat4.scale(this.#LocalMatrix, this.#Scale, this.#LocalMatrix);
                break;
            }
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

    /**
     * @typedef {Vec3 | undefined} Transformation
     * @param {[Transformation, Transformation, Transformation]} transform
     */
    set Transform(transform)
    {
        const [position, rotation, scale] = transform;
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
                    if (scale) this.Scale = scale;
                break;
            }
    }

    /** @param {Vec3} position */
    set Position(position)
    {
        vec3.copy(position, this.#Position);
    }

    get Position()
    {
        return this.#Position;
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
