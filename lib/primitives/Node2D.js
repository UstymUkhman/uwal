import { vec2, mat3 } from "wgpu-matrix";
import { GetParamArray } from "#/utils";

export default class Node2D
{
    /**
     * @import {Vec2, Mat3} from "wgpu-matrix"
     * @typedef {Vec2 | undefined} Transformation
     * @typedef {import("../Scene").default} Scene
     */

    /** @type {boolean} */ Visible = true;
    /** @type {Node2D[]} */ Children = [];
    /** @type {string | undefined} */ Label;

    /** @type {string} */ TransformationOrder = "TRS";
    /** @type {Scene | Node2D | null} */ #Parent = null;
    /** @type {Mat3} */ ProjectionMatrix = mat3.identity();

    /** @type {Mat3} */ #LocalMatrix = mat3.identity();
    /** @type {Mat3} */ #WorldMatrix = mat3.identity();

    /** @type {Vec2} */ #WorldPosition = vec2.create();
    /** @type {Vec2} */ #Scaling = vec2.set(1, 1);
    /** @type {Vec2} */ #Position = vec2.create();
    /** @type {number} */ #Rotation = 0;

    /**
     * @param {string} [label]
     * @param {Node2D | null} [parent = null]
     */
    constructor(label, parent = null)
    {
        this.Label = label;
        this.Parent = parent;
    }

    /**
     * @param {string} label
     * @returns {Node2D | null}
     */
    Find(label)
    {
        let found = null;

        this.Traverse(node =>
            node.Label === label &&
            (found = node) || false
        );

        return found;
    }

    /** @param {Node2D | Node2D[]} children */
    Add(children)
    {
        children = /** @type {Node2D[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /** @param {Node2D | Node2D[]} children */
    Remove(children)
    {
        children = /** @type {Node2D[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /** @param {(node: Node2D) => unknown} callback */
    Traverse(callback)
    {
        if (callback(this)) return;

		for (let c = 0, l = this.Children.length; c < l; ++c)
			this.Children[c].Traverse(callback);
    }

    ResetLocalMatrix()
    {
        mat3.identity(this.#LocalMatrix);
    }

    UpdateWorldMatrix()
    {
        this.UpdateLocalMatrix();

        // `this.#Parent` is always defined and at least is a `Scene` instance in order for a `Node2D` to be updated:
        mat3.multiply(/** @type {Scene | Node2D} */ (this.#Parent).WorldMatrix, this.#LocalMatrix, this.#WorldMatrix);

        this.Children.forEach(child => child.UpdateWorldMatrix());
    }

    UpdateLocalMatrix()
    {
        mat3.identity(this.#LocalMatrix);
        const transformations = this.TransformationOrder.split("");

        for (let t = 0, tl = transformations.length; t < tl; t++)
            switch(transformations[t])
            {
                case "T":
                    mat3.translate(this.#LocalMatrix, this.#Position, this.#LocalMatrix);
                break;

                case "R":
                    mat3.rotate(this.#LocalMatrix, this.#Rotation, this.#LocalMatrix);
                break;

                case "S":
                    mat3.scale(this.#LocalMatrix, this.#Scaling, this.#LocalMatrix);
                break;
            }
    }

    /** @param {boolean} [update = false] */
    GetWorldPosition(update = false)
    {
        update && this.UpdateWorldMatrix();
        return vec2.set(this.#WorldMatrix[8], this.#WorldMatrix[9], this.#WorldPosition);
    }

    /** @param {[Transformation, number | undefined, Transformation]} transform */
    set Transform(transform)
    {
        mat3.identity(this.#LocalMatrix);
        const [position, rotation, scaling] = transform;
        const transformations = this.TransformationOrder.split("");

        for (let t = 0, tl = transformations.length; t < tl; t++)
            switch(transformations[t])
            {
                case "T":
                    if (position) this.Position = position;
                break;

                case "R":
                    if (rotation !== void 0) this.Rotation = rotation;
                break;

                case "S":
                    if (scaling) this.Scaling = scaling;
                break;
            }
    }

    /** @param {Vec2} position */
    set Position(position)
    {
        vec2.copy(position, this.#Position);
        mat3.translate(this.#LocalMatrix, position, this.#LocalMatrix);
    }

    get Position()
    {
        return this.#Position;
    }

    /** @param {number} rotation */
    set Rotation(rotation)
    {
        this.#Rotation = rotation;
        mat3.rotate(this.#LocalMatrix, rotation, this.#LocalMatrix);
    }

    get Rotation()
    {
        return this.#Rotation;
    }

    /** @param {Vec2} scaling */
    set Scaling(scaling)
    {
        vec2.copy(scaling, this.#Scaling);
        mat3.scale(this.#LocalMatrix, scaling, this.#LocalMatrix);
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

    /** @param {Scene | Node2D | null} parent */
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
