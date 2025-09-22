import { Node } from "#/primitives";
import { ERROR, ThrowWarning } from "#/Errors";

export default class Scene extends Node
{
    /** @param {string} [label = "Scene"] */
    constructor(label = "Scene")
    {
        super(label);
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    ResetLocalMatrix()
    {
        ThrowWarning(ERROR.FORBIDDEN_METHOD_CALL, "`Scene.ResetLocalMatrix`.");
    }

    /**
     * @override
     * @todo Convert to method decorator
     * @throws {Error} Forbidden method call
     */
    UpdateProjectionMatrix()
    {
        ThrowWarning(ERROR.FORBIDDEN_METHOD_CALL, "`Scene.UpdateProjectionMatrix`.");
    }
}
