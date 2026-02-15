/**
 * @import {Camera2D, PerspectiveCamera, OrthographicCamera} from "./cameras"
 * @typedef {Camera2D | PerspectiveCamera | OrthographicCamera} Camera
 *
 * @exports Camera
 */

import { GetParamArray } from "#/utils";
import { mat4 } from "wgpu-matrix";

/**
 * @classdesc Content manager for the `canvas` element. Used to add, search, update and remove
 * {@link Mesh}es, {@link Shape}s, {@link Node}s, and lights within the rendering pipeline.
 */
export default class Scene
{
    /**
     * @import {Mat4} from "wgpu-matrix"
     * @import {Node, Mesh, Node2D, Shape} from "./primitives"
     * @typedef {Node | Node2D} SceneNode
     */

    /**
     * @description Name of the scene.
     * @type {string}
     */
    Label;

    /**
     * @description Scene graph elements.
     * @type {SceneNode[]}
     */
    Children = [];

    /**
     * @description Camera to render the scene.
     * @type {Camera | undefined}
     */
    MainCamera = void 0;

    /** @type {Mat4} */ #WorldMatrix = mat4.identity();

    /** @param {string} [label = "Scene"] */
    constructor(label = "Scene")
    {
        this.Label = label;
    }

    /**
     * @description Add any {@link Mesh}, {@link Shape} or {@link Node} element(s) to the scene graph.
     * @param {SceneNode | SceneNode[]} children
     */
    Add(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /**
     * @description Remove any {@link Mesh}, {@link Shape} or {@link Node} element(s) from the scene graph.
     * Only unlinking is performed, `Destroy` method on removed element(s) is not called.
     * @param {SceneNode | SceneNode[]} children
     */
    Remove(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /**
     * @description Add a {@link Camera} as a child and assign it to the `MainCamera` to render all elements
     * from its perspective. To switch to a different camera, simply assign it to the `MainCamera` member.
     * @param {Camera} camera
     */
    AddMainCamera(camera)
    {
        this.Add(this.MainCamera = camera);
    }

    /**
     * @description Update local and world matrices of all elements in the scene graph.
     * Its use is discouraged since this method is called internally on every render.
     */
    UpdateWorldMatrix()
    {
        this.Children.forEach(child => child.UpdateWorldMatrix());
    }

    /**
     * @description Iterate through all descendants by calling `SceneNode.Traverse` on every element of the scene graph.
     * @param {(node: SceneNode) => unknown} callback
     */
    Traverse(callback)
    {
		for (let c = 0, l = this.Children.length; c < l; ++c)
			this.Children[c].Traverse(callback);
    }

    /**
     * @description Iterate through all descendants and call `Destroy` method when available.
     * Remove all scene graph elements and reset the `MainCamera` member.
     */
    Destroy()
    {
        this.Traverse(node =>
            /** @type {Mesh | Shape} */
            (node).Destroy?.()
        );

        this.MainCamera = void 0;
        this.Children.splice(0);
    }

    /**
     * @description Get the world matrix of the scene. Its use is discouraged since
     * this getter is called internally by the `SceneNode.UpdateWorldMatrix` method.
     */
    get WorldMatrix()
    {
        return this.#WorldMatrix;
    }
}
