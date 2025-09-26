import { mat3 } from "wgpu-matrix";

export default class Node2D
{
    /** @typedef {import("wgpu-matrix").Mat3Arg} Mat3 */
    /** @type {Mat3} */ ProjectionMatrix = mat3.identity();

    /**
     * @param {string} [label]
     * @param {Node2D} [parent = null]
     */
    constructor(label, parent = null)
    {
        this.Label = label;
        this.Parent = parent;
    }

    UpdateProjectionMatrix()
    {}

    ResetProjectionMatrix()
    {
        this.ProjectionMatrix = mat3.identity();
    }
}
