import { Node } from "#/primitives";
import { ERROR, ThrowWarning } from "#/Errors";

export default class Scene extends Node
{
    /** @type {Set<Node>} */ #Cameras = new Set();
    /** @type {Node | undefined} */ MainCamera;

    /** @param {string} [label = "Scene"] */
    constructor(label = "Scene")
    {
        super(label);
        Reflect.deleteProperty(this, "ProjectionMatrix");
    }

    /** @param {Node} camera */
    AddCamera(camera)
    {
        super.Add(camera);
        this.#Cameras.add(camera);

        if (this.#Cameras.size === 1)
            this.MainCamera = camera;
    }

    /** @param {Node} camera */
    RemoveCamera(camera)
    {
        super.Remove(camera);
        this.#Cameras.delete(camera);

        if (this.MainCamera === camera)
            this.MainCamera = undefined;
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
     */
    UpdateProjectionMatrix()
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
     */
    Translate()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.Translate`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    RotateAxis()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateAxis`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    RotateX()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateX`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    RotateY()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateY`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    RotateZ()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.RotateZ`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    Scale()
    {
        ThrowWarning(ERROR.INVALID_CALL, "method: `Scene.Scale`.");
    }

    Destroy()
    {
        this.#Cameras.clear();
        this.MainCamera = void 0;
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     * @typedef {Vec3 | undefined} Transformation
     * @typedef {import("./primitives/Node").Transformation} Transformation
     * @param {[Transformation, Transformation, Transformation]} transform
     */
    set Transform(transform)
    {
        ThrowWarning(ERROR.INVALID_CALL, "setter: `Scene.Transform`.");
    }

    /**
     * @override
     * @todo Convert to property decorator
     * @throws {Error} Forbidden method call
     * @param {Vec3} position
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
     * @param {Vec3} rotation
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
     * @param {Vec3} scaling
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
