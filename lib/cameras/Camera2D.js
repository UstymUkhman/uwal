import { Node2D } from "#/primitives";
import { vec2, vec3, mat3 } from "wgpu-matrix";

export default class Camera2D extends Node2D
{
    /**
     * @typedef {import("wgpu-matrix").Vec2} Vec2
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
    /** @type {Float32Array} */ #Rectangle = new Float32Array(4);
    /** @type {import("wgpu-matrix").Vec3} */ #Position3D = vec3.create();

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

    /** @param {import("../primitives/Shape").default} Shape */
    Contains(Shape)
    {
        // Always render if cull test is disabled:
        if (!Shape.CullTest) return true;

        const [t, r, b, l] = this.#Rectangle;
        const { Min: [left, top], Max: [right, bottom] } = Shape.BoundingBox;
        return !(b < top || l > right || t > bottom || r < left);
    }

    /** @param {import("wgpu-matrix").Vec2 | number[]} size */
    set Size([width, height])
    {
        this.#Width = width; this.#Height = height;
        this.#Center.set([width / 2, height / 2]);
        this.UpdateProjectionMatrix();
    }

    // Alias for `#RenderScene` method:
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
     * @description Camera position on the Z-axis used in light calculations
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
