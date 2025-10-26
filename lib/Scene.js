import { Node } from "#/primitives";
import { ERROR, ThrowWarning } from "#/Errors";

export default class Scene extends Node
{
    /**
     * @typedef {import("wgpu-matrix").Vec2Arg} Vec2
     * @typedef {import("wgpu-matrix").Vec3Arg} Vec3
     * @typedef {import("./primitives").Node2D | Node} SceneNode
     */

    /** @override @type {SceneNode[]} */ Children = [];
    /** @type {Set<SceneNode>} */ #Cameras = new Set();
    /** @type {SceneNode | undefined} */ MainCamera;

    /** @param {string} [label = "Scene"] */
    constructor(label = "Scene")
    {
        super(label);
        Reflect.deleteProperty(this, "ProjectionMatrix");
    }

    /**
     * @override
     * @param {string} label
     * @returns {SceneNode | null}
     */
    Find(label)
    {
        let found = super.Find(label);
        if (found) return found;

        for (const camera of this.#Cameras)
            if (camera.Label === label)
                return camera;

        return null;
    }

    /**
     * @override
     * @param {SceneNode | SceneNode[]} children
     */
    Add(children)
    {
        return super.Add(children);
    }

    /**
     * @override
     * @param {SceneNode | SceneNode[]} children
     */
    Remove(children)
    {
        return super.Remove(children);
    }

    /** @param {SceneNode} camera */
    AddCamera(camera)
    {
        this.#Cameras.add(camera);

        if (this.#Cameras.size === 1)
            this.MainCamera = camera;
    }

    /** @param {SceneNode} camera */
    RemoveCamera(camera)
    {
        this.#Cameras.delete(camera);

        if (this.MainCamera === camera)
            this.MainCamera = undefined;
    }

    /**
     * @override
     * @param {(node: Node2D) => unknown} callback
     */
    Traverse(callback)
    {
        return super.Traverse(callback);
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    ResetLocalMatrix()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.ResetLocalMatrix`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {import("wgpu-matrix").Mat4Arg} cameraProjection
     */
    UpdateProjectionMatrix(cameraProjection)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.UpdateProjectionMatrix`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    ResetProjectionMatrix()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.ResetProjectionMatrix`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {Vec3} axis
     * @param {number} rotation
     */
    RotateAxis(axis, rotation)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateAxis`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {number} rotation
     */
    RotateX(rotation)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateX`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {number} rotation
     */
    RotateY(rotation)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateY`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {number} rotation
     */
    RotateZ(rotation)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateZ`.");
    }

    /**
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {number} rotation
     */
    Rotate(rotation)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.Rotate`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     * @param {Vec2 | Vec3} scaling
     */
    Scale(scaling)
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.Scale`.");
    }

    Destroy()
    {
        this.Traverse(node => this !== node && node.Destroy?.());
        this.MainCamera = void 0;
        this.Children.splice(0);
        this.#Cameras.clear();
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     * @typedef {Vec2 | Vec3 | undefined} Transformation
     * @param {[Transformation, Transformation | number, Transformation]} transform
     */
    set Transform(transform)
    {
        ThrowWarning(ERROR.INVALID_CALL, "setter: `Scene.Transform`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     * @param {Vec2 | Vec3} position
     */
    set Position(position)
    {
        ThrowWarning(ERROR.INVALID_CALL, "setter: `Scene.Position`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     */
    get Position()
    {
        ThrowWarning(ERROR.INVALID_CALL, "getter: `Scene.Position`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     * @param {Vec3 | number} rotation
     */
    set Rotation(rotation)
    {
        ThrowWarning(ERROR.INVALID_CALL, "setter: `Scene.Rotation`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     */
    get Rotation()
    {
        ThrowWarning(ERROR.INVALID_CALL, "getter: `Scene.Rotation`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     * @param {Vec2 | Vec3} scaling
     */
    set Scaling(scaling)
    {
        ThrowWarning(ERROR.INVALID_CALL, "setter: `Scene.Scaling`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     */
    get Scaling()
    {
        ThrowWarning(ERROR.INVALID_CALL, "getter: `Scene.Scaling`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     */
    get LocalMatrix()
    {
        ThrowWarning(ERROR.INVALID_CALL, "getter: `Scene.LocalMatrix`.");
    }
}
