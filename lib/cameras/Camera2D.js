/** @module Camera2D */

import { Clamp } from "#/utils/Math";
import { Node2D } from "#/primitives/Node2D";
import { vec2, vec3, mat3 } from "wgpu-matrix";

/**
 * Camera manager class for scenes using 2D nodes and shapes.
 *
 * @noInheritDoc
 */
export class Camera2D extends Node2D
{
    /**
     * @import {Vec2, Vec3, Mat3} from "wgpu-matrix"
     * @typedef {import("../primitives/Shape").CullTest} CullTest
     */

    /**
     * Defaults to axis-aligned bounding box.
     *
     * @type {CullTest[keyof CullTest]}
     */
    CullTest = 2;

    /** @type {number} */ #Zoom = 1;
    /** @type {number} */ #Width = 0;
    /** @type {number} */ #Height = 0;

    /** @type {false} */ #DepthSorting = false;
    /** @type {Vec2} */ #Center = vec2.create();

    /** @type {Vec3} */ #Position3D = vec3.create();
    /** @type {Vec3} */ #ViewCenter = vec3.create();
    /** @type {Mat3} */ #ViewMatrix = mat3.identity();

    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {Mat3} */ #ProjectionMatrix = mat3.identity();

    /** @typedef {import("../primitives/Shape").default} Shape */
    /** @type {Float32Array} */ #Rectangle = new Float32Array(4);

    /**
     * @param {Renderer | number} [rendererWidth = innerWidth] - Width of the viewport or a `Renderer` instance.
     * @param {number} [height = innerHeight] - Height of the viewport, optional when called with a `Renderer` instance.
     */
    constructor(rendererWidth = innerWidth, height = innerHeight)
    {
        super("Camera2D");

        this.Size = /** @type {number[]} */ (
            typeof rendererWidth !== "number" &&
            rendererWidth.CanvasSize || [rendererWidth, height]
        );
    }

    #UpdateViewportRectangle()
    {
        const halfWidth  = this.#Width  / (this.#Zoom * 2);
        const halfHeight = this.#Height / (this.#Zoom * 2);

        this.#Rectangle.set(
        [
            this.#Center[1] - halfHeight, // Top
            this.#Center[0] + halfWidth , // Right
            this.#Center[1] + halfHeight, // Bottom
            this.#Center[0] - halfWidth   // Left
        ]);

        return this.#Rectangle;
    }

    /**
     * Compute the projection matrix and write the result into the corresponding uniform buffer if present.
     */
    UpdateProjectionMatrix()
    {
        const [t, r, b, l] = this.#UpdateViewportRectangle();

        mat3.set(2 / r, 0, 0, 0, -2 / b, 0, l / r * 2 - 1, t / b * -2 + 1, 1, this.#ProjectionMatrix);

        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#ProjectionMatrix), 64
        );
    }

    /**
     * Create and update an internal uniform buffer of this camera's projection matrix.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this camera's projection.
     */
    SetRenderPipeline(Pipeline)
    {
        this.#MatrixBuffer = (this.#Pipeline = Pipeline).CreateUniformBuffer(
            "CameraMatrix", { label: `${this.Label} Matrix Buffer` }
        ).buffer;

        this.UpdateProjectionMatrix();

        return this.#MatrixBuffer;
    }

    /**
     * @hidden
     * Compute the view distance to the shape in 3D space.
     *
     * @param {Shape} Shape - Target shape to calculate the distance to.
     */
    GetViewSpaceCenter(Shape)
    {
        if (!this.#DepthSorting)
            return 0;

        const [x, y] = Shape.Center;

        // Camera2D can only have the scene as a parent element,
        // so using its `LocalMatrix` is fine in this case.
        mat3.inverse(this.LocalMatrix, this.#ViewMatrix);

        vec3.set(x, y, this.#Position3D[2], this.#ViewCenter);
        vec3.transformMat3(this.#ViewCenter, this.#ViewMatrix, this.#ViewCenter);

        return -this.#ViewCenter[2];
    }

    /**
     * Check if a shape is contained in the camera's viewport when cull testing is performed.
     * This method is called internally on every render when cull testing is enabled.
     *
     * @param {Shape} Shape - 2D shape to test for culling.
     * @returns {boolean} Whether the shape is in the camera's viewport.
     */
    Contains(Shape)
    {
        // Always render if cull testing is disabled.
        if (!Shape.CullTest)
            return true;

        const [t, r, b, l] = this.#Rectangle;

        if (Shape.CullTest === 1 || this.CullTest === 1)
        {
            const { Center, Radius } = Shape;
            const x = Center[0] - Clamp(Center[0], l, r);
            const y = Center[1] - Clamp(Center[1], t, b);

            return x * x + y * y <= Radius * Radius;
        }
        else
        {
            const { Min: [left, top], Max: [right, bottom] } = Shape.BoundingBox;
            return !(b < top || l > right || t > bottom || r < left);
        }
    }

    /**
     * Destroy the internal projection matrix buffer.
     */
    Destroy()
    {
        this.#Pipeline = this.#MatrixBuffer?.destroy();
    }

    /**
     * @returns {GPUBuffer | undefined} Matrix buffer created by the [SetRenderPipeline](#setrenderpipeline) method.
     */
    get MatrixBuffer()
    {
        return this.#MatrixBuffer;
    }

    /**
     * @param {Vec2 | number[]} size - Camera's viewport width and height.
     */
    set Size([width, height])
    {
        this.#Width = width; this.#Height = height;
        this.#Center.set([width / 2, height / 2]);
        this.UpdateProjectionMatrix();
    }

    /**
     * @param {number} z - Camera's position on the Z-axis used in light calculations.
     */
    set PositionZ(z)
    {
        this.#Position3D[2] = z;
    }

    /**
     * @returns {Vec3} Camera's position in 3D space.
     */
    get Position3D()
    {
        vec2.copy(this.Position, this.#Position3D)
        return this.#Position3D;
    }
}
