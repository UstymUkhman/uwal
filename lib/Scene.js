import { mat4 } from "wgpu-matrix";
import { GetParamArray } from "#/utils";

/**
 * @typedef {import("./primitives").Node2D | import("./primitives").Node} SceneNode
 * @import {Camera2D, OrthographicCamera, PerspectiveCamera} from "./cameras"
 * @typedef {Camera2D | OrthographicCamera | PerspectiveCamera} Camera
 * @exports Camera
 */

/**
 * Content manager for objects rendered onto the `canvas` element.
 * Used to add, search, update, and remove nodes, 2D shapes, and 3D meshes within the rendering pipeline.
 */
export class Scene
{
    /**
     * Scene name.
     *
     * @type {string}
     */
    Label;

    /**
     * List of all elements in the scene graph.
     *
     * @type {SceneNode[]}
     */
    Children = [];

    /**
     * Camera from the point of view of which the scene will be rendered.
     *
     * @type {Camera | undefined}
     */
    MainCamera = void 0;

    /**
     * @type {import("wgpu-matrix").Mat4}
     */
    #WorldMatrix = mat4.identity();

    /** @typedef {import("./primitives").Shape | import("./primitives").Mesh} SceneElement */

    /**
     * @param {string} [label = "Scene"] - Scene name.
     */
    constructor(label = "Scene")
    {
        this.Label = label;
    }

    /**
     * Add any `Mesh`, `Shape` or `SceneNode` element(s) to the scene graph.
     *
     * @param {SceneNode | SceneNode[]} children - Element(s) to add.
     */
    Add(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = this));
    }

    /**
     * Remove any `Mesh`, `Shape` or `SceneNode` element(s) from the scene graph.
     * Only unlinking is performed, the `Destroy` method on removed element(s) is not called.
     *
     * @param {SceneNode | SceneNode[]} children - Element(s) to remove.
     */
    Remove(children)
    {
        children = /** @type {SceneNode[]} */ (/*@__INLINE__*/ GetParamArray(children));
        children.forEach(child => (child.Parent = null));
    }

    /**
     * Add a [`Camera`](#camera) as a child of the scene and assign it to the [`MainCamera`](#maincamera) property.
     * To switch to a different camera, simply assign it to the `MainCamera` member.
     * @see [Cameras / UV Mapping](https://ustymukhman.github.io/uwal/dist/examples/examples.html#cameras-uv-mapping) for reference.
     *
     * @param {Camera} camera - Camera to use.
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
     * Perform the `callback` function on every element of the scene graph.
     * The scene itself will be **excluded** from the iteration.
     *
     * @param {(node: SceneNode) => unknown} callback - Function to call with the child element.
     */
    Traverse(callback)
    {
		for (let c = 0, l = this.Children.length; c < l; ++c)
        {
			this.Children[c].Traverse(callback);
        }
    }

    /**
     * Call the `Destroy` method on every element of the scene graph if available.
     * Remove all [children](#children) and reset the `MainCamera` member.
     */
    Destroy()
    {
        this.Traverse(node => /** @type {SceneElement} */ (node).Destroy?.());
        this.MainCamera = undefined;
        this.Children.splice(0);
    }

    /**
     * @returns The world matrix of the scene. Its use is discouraged since this
     * getter is called internally when updating the camera's view projection matrix.
     */
    get WorldMatrix()
    {
        return this.#WorldMatrix;
    }
}
