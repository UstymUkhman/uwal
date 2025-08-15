import { mat4 } from "wgpu-matrix";

export default class SceneNode
{
    /**
     * @typedef {import("wgpu-matrix").Mat4Arg} Mat4
     * @typedef {import("./Transform").default} Transform
     */

    /** @type {Transform | undefined} */ #Transform;
    /** @type {SceneNode | null} */ #Parent = null;
    /** @type {SceneNode[]} */ Children = [];
    /** @type {string} */ #Label = "";

    #LocalMatrix = mat4.identity();
    #WorldMatrix = mat4.identity();

    /**
     * @param {string} [label = ""]
     * @param {Transform} [transform]
     */
    constructor(label = "", transform)
    {
        this.#Label = label;
        this.#Transform = transform;
    }

    /** @param {SceneNode} child */
    Add(child)
    {
        child.Parent = this;
    }

    /** @param {SceneNode} child */
    Remove(child)
    {
        child.Parent = null;
    }

    /** @param {Mat4} parent */
    UpdateWorldMatrix(parent)
    {
        // Update local matrix from its transform:
        this.#Transform?.GetMatrix(this.#LocalMatrix);

        !parent
            ? mat4.copy(this.#LocalMatrix, this.#WorldMatrix)
            : mat4.multiply(parent, this.#LocalMatrix, this.#WorldMatrix);

        this.Children.forEach(child => child.UpdateWorldMatrix(this.#WorldMatrix));
    }

    /** @param {SceneNode | null} parent */
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

    get LocalMatrix()
    {
        return this.#LocalMatrix;
    }

    get WorldMatrix()
    {
        return this.#WorldMatrix;
    }
}
