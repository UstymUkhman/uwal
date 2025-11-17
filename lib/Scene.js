import { GetParamArray } from "#/utils";
import { mat4 } from "wgpu-matrix";

/**
 * @import {Camera2D, PerspectiveCamera, OrthographicCamera} from "./cameras"
 * @typedef {Camera2D | PerspectiveCamera | OrthographicCamera} Camera
 *
 * @exports Camera
 */

export default class Scene
{
    /**
     * @import {Mat4} from "wgpu-matrix"
     * @import {Node, Mesh, Node2D, Shape} from "./primitives"
     * @typedef {Node | Node2D} SceneNode
     */

    /** @type {string} */ Label;
    /** @type {SceneNode[]} */ Children = [];
    /** @type {Camera | undefined} */ MainCamera;
    /** @type {Set<Camera>} */ #Cameras = new Set();
    /** @type {Mat4} */ #WorldMatrix = mat4.identity();

    /** @param {string} [label = "Scene"] */
    constructor(label = "Scene")
    {
        this.Label = label;
    }

    /** @param {string} label */
    Find(label)
    {
        let found = null;

        this.Traverse(node =>
            node.Label === label &&
            (found = node) || false
        );

        if (found) return found;

        for (const camera of this.#Cameras)
            if (camera.Label === label)
                return camera;

        return null;
    }

    /** @param {SceneNode | SceneNode[]} children */
    Add(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /** @param {SceneNode | SceneNode[]} children */
    Remove(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /** @param {Camera} camera */
    AddCamera(camera)
    {
        this.#Cameras.add(camera);

        if (this.#Cameras.size === 1)
            this.MainCamera = camera;
    }

    /** @param {Camera} camera */
    RemoveCamera(camera)
    {
        this.#Cameras.delete(camera);

        if (this.MainCamera === camera)
            this.MainCamera = undefined;
    }

    UpdateWorldMatrix()
    {
        this.Children.forEach(child => child.UpdateWorldMatrix());
    }

    /** @param {(node: SceneNode) => unknown} callback */
    Traverse(callback)
    {
		for (let c = 0, l = this.Children.length; c < l; ++c)
			this.Children[c].Traverse(callback);
    }

    Destroy()
    {
        this.Traverse(node =>
            /** @type {Mesh | Shape} */
            (node).Destroy?.()
        );

        this.MainCamera = void 0;
        this.Children.splice(0);
        this.#Cameras.clear();
    }

    get WorldMatrix()
    {
        return this.#WorldMatrix;
    }
}
