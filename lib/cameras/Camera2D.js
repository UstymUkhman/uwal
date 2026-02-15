import { Node2D } from "#/primitives";
import { vec2, vec3, mat3 } from "wgpu-matrix";

export default class Camera2D extends Node2D
{
    /**
     * @import {Vec2, Vec3, Mat3} from "wgpu-matrix"
     * @typedef {import("../primitives/Shape").CullTest} CullTest
     */

    /**
     * @type {CullTest[keyof CullTest]}
     * @default 1 Axis-Aligned Bounding Box
     */
    CullTest = 1;

    /** @type {number} */ #Zoom = 1;
    /** @type {number} */ #Width = 0;
    /** @type {number} */ #Height = 0;

    /** @type {Vec2} */ #Center = vec2.create();
    /** @type {boolean} */ #DepthSorting = false;

    /** @type {Vec3} */ #Position3D = vec3.create();
    /** @type {Vec3} */ #ViewCenter = vec3.create();
    /** @type {Mat3} */ #ViewMatrix = mat3.identity();

    /** @typedef {import("../primitives/Shape").default} Shape */
    /** @type {Float32Array} */ #Rectangle = new Float32Array(4);

    /**
     * @param {Renderer | number} [rendererWidth = innerWidth]
     * @param {number} [height = innerHeight]
     */
    constructor(rendererWidth = innerWidth, height = innerHeight)
    {
        super("Camera2D");

        this.Size = /** @type {number[]} */ (typeof rendererWidth !== "number" &&
            rendererWidth.CanvasSize || [rendererWidth, height]
        );
    }

    #UpdateViewportRectangle()
    {
        const halfWidth  = this.#Width  / (this.#Zoom * 2);
        const halfHeight = this.#Height / (this.#Zoom * 2);

        this.#Rectangle.set([
            this.#Center[1] - halfHeight, // Top
            this.#Center[0] + halfWidth , // Right
            this.#Center[1] + halfHeight, // Bottom
            this.#Center[0] - halfWidth   // Left
        ]);

        return this.#Rectangle;
    }

    UpdateProjectionMatrix()
    {
        const [t, r, b, l] = this.#UpdateViewportRectangle();
        return mat3.set(2 / r, 0, 0, 0, -2 / b, 0, l / r * 2 - 1, t / b * -2 + 1, 1, this.ProjectionMatrix);
    }

    /** @param {Shape} Shape */
    GetViewSpaceCenter(Shape)
    {
        if (!this.#DepthSorting) return 0;
        const [x, y] = Shape.Center;

        // This camera can only have the scene as a parent
        // element, so `LocalMatrix` is fine in this case:
        mat3.inverse(this.LocalMatrix, this.#ViewMatrix);

        vec3.set(x, y, this.#Position3D[2], this.#ViewCenter);
        vec3.transformMat3(this.#ViewCenter, this.#ViewMatrix, this.#ViewCenter);
        return -this.#ViewCenter[2];
    }

    /** @param {Shape} Shape */
    GetViewSpaceDistance(Shape)
    {
        if (!this.#DepthSorting) return 0;
        return this.GetViewSpaceCenter(Shape) + Shape.Geometry.Radius;
    }

    /** @param {Shape} Shape */
    Contains(Shape)
    {
        // Always render if cull test is disabled:
        if (!Shape.CullTest) return true;

        const [t, r, b, l] = this.#Rectangle;
        const { Min: [left, top], Max: [right, bottom] } = Shape.BoundingBox;
        return !(b < top || l > right || t > bottom || r < left);
    }

    /** @param {Vec2 | number[]} size */
    set Size([width, height])
    {
        this.#Width = width; this.#Height = height;
        this.#Center.set([width / 2, height / 2]);
        this.UpdateProjectionMatrix();
    }

    // Alias for `#RenderScene` method.
    get ViewProjectionMatrix()
    {
        return this.ProjectionMatrix;
    }

    /**
     * @override
     * @param {Vec2} position
     */
    set Position(position)
    {
        super.Position = position;
        this.#Position3D[0] = position[0];
        this.#Position3D[1] = position[1];
    }

    /**
     * @description Camera position on the Z-axis used in light calculations.
     * @param {number} z
     */
    set PositionZ(z)
    {
        this.#Position3D[2] = z;
    }

    get Position3D()
    {
        return this.#Position3D;
    }

    /** @override */
    get Position()
    {
        return super.Position;
    }
}
