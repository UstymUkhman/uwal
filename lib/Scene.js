/**
 * @import {Camera2D, PerspectiveCamera, OrthographicCamera} from "./cameras"
 * @typedef {Camera2D | PerspectiveCamera | OrthographicCamera} Camera
 * @import {Node, Mesh, Node2D, Shape} from "./primitives"
 * @typedef {Node | Node2D} SceneNode
 *
 * @exports Camera
 */

import { GetParamArray } from "#/utils";
import { mat4 } from "wgpu-matrix";

/**
 * Content manager for the `canvas` element. Used to add, search, update
 * and remove Nodes, 2D Shapes, and 3D Meshes within the rendering pipeline.
 */
export class Scene
{
    /**
     * Name of the scene.
     * @type {string}
     */
    Label;

    /**
     * List of all elements in the scene graph.
     * @type {SceneNode[]}
     */
    Children = [];

    /**
     * Camera from whose point of view the scene will be rendered.
     * @type {Camera | undefined}
     */
    MainCamera = void 0;

    /** @type {import("wgpu-matrix").Mat4} */ #WorldMatrix = mat4.identity();

    /** @param {string} [label = "Scene"] - Name of the scene */
    constructor(label = "Scene")
    {
        this.Label = label;
    }

    /**
     * Add any `Mesh`, `Shape` or `SceneNode` element(s) to the scene graph.
     * @param {SceneNode | SceneNode[]} children - List of elements to add
     */
    Add(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /**
     * Remove any `Mesh`, `Shape` or `SceneNode` element(s) from the scene graph.
     * Only unlinking is performed, `Destroy` method on removed element(s) is not called.
     * @param {SceneNode | SceneNode[]} children - List of elements to remove
     */
    Remove(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /**
     * Add a [`Camera`](./Scene.md#camera) as a child of the scene and assign it to the [`MainCamera`](./Scene.md#maincamera) property.
     * To switch to a different camera, simply assign it to the `MainCamera` member.
     * @see [Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.
     * @param {Camera} camera - Camera to use
     */
    AddMainCamera(camera)
    {
        this.Add(this.MainCamera = camera);
    }

    /**
     * Update local and world matrices of all elements in the scene graph.
     * Its use is discouraged since this method is called internally on every render.
     */
    UpdateWorldMatrix()
    {
        this.Children.forEach(child => child.UpdateWorldMatrix());
    }

    /**
     * Perform the `callback` function on every element of the scene graph.<br />
     * *NOTE*: The scene itself will be **excluded** from the iteration.
     * @param {(node: SceneNode) => unknown} callback - Function to call with the reference of the child element
     */
    Traverse(callback)
    {
		for (let c = 0, l = this.Children.length; c < l; ++c)
			this.Children[c].Traverse(callback);
    }

    /**
     * Call the `Destroy` method on every element of the scene graph when available.
     * Remove all [children](./Scene.md#children) and reset the [`MainCamera`](./Scene.md#maincamera) member.
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
     * Get the world matrix of the scene. Its use is discouraged since this
     * getter is called internally when updating camera's view projection matrix.
     */
    get WorldMatrix()
    {
        return this.#WorldMatrix;
    }
}
