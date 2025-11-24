import { vec3, mat4 } from "wgpu-matrix";
import { GetParamArray } from "#/utils";

export default class Node
{
    /**
     * @import {Vec3, Mat4} from "wgpu-matrix"
     * @typedef {Vec3 | undefined} Transformation
     * @typedef {import("../Scene").default} Scene
     */

    /** @type {Node[]} */ Children = [];
    /** @type {string | undefined} */ Label;

    /** @type {string} */ RotationOrder = "XYZ";
    /** @type {string} */ TransformationOrder = "TRS";
    /** @type {Scene | Node | null} */ #Parent = null;

    /** @type {Mat4} */ ProjectionMatrix = mat4.identity();
    /** @type {Mat4} */ #LocalMatrix = mat4.identity();
    /** @type {Mat4} */ #WorldMatrix = mat4.identity();

    /** @type {Vec3} */ #Scaling = vec3.set(1, 1, 1);
    /** @type {Vec3} */ #Position = vec3.create();
    /** @type {Vec3} */ #Rotation = vec3.create();

    /**
     * @param {string} [label]
     * @param {Node | null} [parent = null]
     */
    constructor(label, parent = null)
    {
        this.Label = label;
        this.Parent = parent;
    }

    /**
     * @param {string} label
     * @returns {Node | null}
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

    /** @param {Node | Node[]} children */
    Add(children)
    {
        children = /** @type {Node[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /** @param {Node | Node[]} children */
    Remove(children)
    {
        children = /** @type {Node[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /** @param {(node: Node) => unknown} callback */
    Traverse(callback)
    {
        if (callback(this)) return;

		for (let c = 0, l = this.Children.length; c < l; ++c)
			this.Children[c].Traverse(callback);
    }

    ResetLocalMatrix()
    {
        mat4.identity(this.#LocalMatrix);
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
        mat4.identity(this.#LocalMatrix);
        const transformations = this.TransformationOrder.split("");

        for (let t = 0, tl = transformations.length; t < tl; t++)
            switch(transformations[t])
            {
                case "T":
                    mat4.translate(this.#LocalMatrix, this.#Position, this.#LocalMatrix);
                break;

                case "R":
                    for (let o = 0, ol = this.RotationOrder.length; o < ol; ++o)
                    {
                        const order = /** @type {"X" | "Y" | "Z"} */ (this.RotationOrder[o]);
                        const r = this.#Rotation[order.charCodeAt(0) - 88];
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
        mat4.identity(this.ProjectionMatrix);
    }

    /** @param {[Transformation, Transformation, Transformation]} transform */
    set Transform(transform)
    {
        mat4.identity(this.#LocalMatrix);
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
        mat4.translate(this.#LocalMatrix, position, this.#LocalMatrix);
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
            const order = /** @type {"X" | "Y" | "Z"} */ (this.RotationOrder[o]);
            const r = rotation[order.charCodeAt(0) - 88];
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

    /** @param {Scene | Node | null} parent */
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
