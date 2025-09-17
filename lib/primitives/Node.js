import { vec3, mat4 } from "wgpu-matrix";

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

    /** @type {Vec3} */ #Scale = vec3.create(1, 1, 1);
    /** @type {Vec3} */ #Translation = vec3.create();
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

    /** @param {Node} child */
    Add(child)
    {
        child.Parent = this;
    }

    /** @param {Node} child */
    Remove(child)
    {
        child.Parent = null;
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

    /** @param {Mat4} [parent] */
    UpdateWorldMatrix(parent)
    {
        this.#UpdateLocalMatrix();

        !parent
            ? mat4.copy(this.#LocalMatrix, this.#WorldMatrix)
            : mat4.multiply(parent, this.#LocalMatrix, this.#WorldMatrix);

        this.Children.forEach(child => child.UpdateWorldMatrix(this.#WorldMatrix));
    }

    #UpdateLocalMatrix()
    {
        const transformations = this.TransformationOrder.split("");

        for (let t = 0, tl = transformations.length; t < tl; t++)
        {
            switch(transformations[t])
            {
                case "T":
                    mat4.translation(this.#Translation, this.#LocalMatrix);
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
    }

    /**
     * @typedef {Vec3 | undefined} Transformation
     * @param {[Transformation, Transformation, Transformation]} transform
     */
    set Transform(transform)
    {
        const [translation, rotation, scale] = transform;
        if (translation) this.Translation = translation;
        if (rotation)    this.Rotation    = rotation;
        if (scale)       this.Scale       = scale;
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
