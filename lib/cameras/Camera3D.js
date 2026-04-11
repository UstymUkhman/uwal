import { Node } from "#/primitives";
import { MathUtils } from "#/utils";
import { vec3, mat4, quat } from "wgpu-matrix";

export default class Camera3D extends Node
{
    /**
     * @import {Vec3, Quat} from "wgpu-matrix"
     * @typedef {import("../primitives").Mesh} Mesh
     */

    /**
     * @typedef {import("../primitives/Mesh").CullTest} CullTest
     * @type {CullTest[keyof CullTest]}
     * @default 1 Bounding Sphere
     */
    CullTest = 1;

    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;

    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);
    /** @type {Quat} */ #Rotation = quat.create();
    /** @type {Vec3} */ #ViewCenter = vec3.create();

    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {Quat} */ #ParentRotation = quat.create();
    /** @type {boolean} */ AutoUpdateWorldMatrix = false;

    /** @type {Float32Array} */ #ViewMatrix = mat4.identity();
    /** @type {Float32Array} */ #Frustum = new Float32Array(24);
    /** @type {Float32Array} */ #RotationMatrix = mat4.identity();
    /** @type {Float32Array} */ #ViewProjectionMatrix = mat4.identity();

    /**
     * @param {number} [near = 1]
     * @param {number} [far = 1000]
     * @param {string} [label]
     */
    constructor(near = 1, far = 1e3, label)
    {
        super(label);

        this.#Near = near;
        this.#Far = far;
    }

    /** @see {@link https://www8.cs.umu.se/kurser/5DV051/HT12/lab/plane_extraction.pdf} */
    #UpdateFrustumPlanes()
    {
        const [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ] = this.#ViewProjectionMatrix;

        // Left Plane:
        this.#Frustum[ 0] = m03 - m00;
        this.#Frustum[ 1] = m13 - m10;
        this.#Frustum[ 2] = m23 - m20;
        this.#Frustum[ 3] = m33 - m30;

        // Right Plane:
        this.#Frustum[ 4] = m03 + m00;
        this.#Frustum[ 5] = m13 + m10;
        this.#Frustum[ 6] = m23 + m20;
        this.#Frustum[ 7] = m33 + m30;

        // Top Plane:
        this.#Frustum[ 8] = m03 + m01;
        this.#Frustum[ 9] = m13 + m11;
        this.#Frustum[10] = m23 + m21;
        this.#Frustum[11] = m33 + m31;

        // Bottom Plane:
        this.#Frustum[12] = m03 - m01;
        this.#Frustum[13] = m13 - m11;
        this.#Frustum[14] = m23 - m21;
        this.#Frustum[15] = m33 - m31;

        // Far Plane:
        this.#Frustum[16] = m03 - m02;
        this.#Frustum[17] = m13 - m12;
        this.#Frustum[18] = m23 - m22;
        this.#Frustum[19] = m33 - m32;

        // Near Plane:
        this.#Frustum[20] = m03 + m02;
        this.#Frustum[21] = m13 + m12;
        this.#Frustum[22] = m23 + m22;
        this.#Frustum[23] = m33 + m32;

        // Normalize all planes distances:
        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
        {
            const length = Math.hypot(
                this.#Frustum[p + 0],
                this.#Frustum[p + 1],
                this.#Frustum[p + 2]
            ) || 1;

            this.#Frustum[p + 0] /= length;
            this.#Frustum[p + 1] /= length;
            this.#Frustum[p + 2] /= length;
            this.#Frustum[p + 3] /= length;
        }

        return this.#Frustum;
    }

    #UpdateWorldMatrixBuffer()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.WorldMatrix), 0
        );
    }

    UpdateProjectionMatrix()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.ProjectionMatrix), 64
        );

        return this.ProjectionMatrix;
    }

    /**
     * @override
     * @param {boolean} [force = false]
     */
    UpdateWorldMatrix(force = false)
    {
        if (!this.AutoUpdateWorldMatrix && !force)
        {
            return this.#UpdateWorldMatrixBuffer();
        }

        this.Parent && super.UpdateWorldMatrix();
        this.UpdateViewProjectionMatrix(false);
        this.#UpdateWorldMatrixBuffer();
    }

    /** @param {boolean} [updateWorldMatrix = true] */
    UpdateViewProjectionMatrix(updateWorldMatrix = true)
    {
        const { Parent, WorldMatrix, LocalMatrix } = this;

        !updateWorldMatrix ? mat4.inverse(WorldMatrix, this.#ViewMatrix) : mat4.inverse(
            // If the camera has a parent element, invert its world matrix;
            // othervise use the camera's local matrix if it hasn't been added to the scene yet.
            Parent && mat4.multiply(Parent.WorldMatrix, LocalMatrix, WorldMatrix) || LocalMatrix, this.#ViewMatrix
        );

        mat4.multiply(this.ProjectionMatrix, this.#ViewMatrix, this.#ViewProjectionMatrix);

        this.#UpdateFrustumPlanes();
        return this.#ViewProjectionMatrix;
    }

    /**
     * @param {Vec3} target
     * @param {Vec3} [up = [0, 1, 0]]
     */
    LookAt(target, up = this.#Up)
    {
        this.UpdateWorldMatrix(true);

        mat4.cameraAim(this.Position, target, up, this.LocalMatrix);

        // Extract the rotation component to keep the `LocalMatrix` consistent when
        // updating it in the `UpdateWorldMatrix` and `UpdateViewProjectionMatrix` methods.
        quat.fromMat(this.LocalMatrix, this.#Rotation);

        if (this.Parent)
        {
            MathUtils.CopyMat4Rotation(this.Parent.WorldMatrix, this.#RotationMatrix);
            quat.fromMat(this.#RotationMatrix, this.#ParentRotation);
            quat.inverse(this.#ParentRotation, this.#ParentRotation);
            quat.multiply(this.#ParentRotation, this.#Rotation, this.#Rotation);
        }

        mat4.fromQuat(this.#Rotation, this.#RotationMatrix);
        MathUtils.GetMat4Rotation(this.#RotationMatrix, this.Rotation, this.RotationOrder);
    }

    /**
     * @param {RenderPipeline} Pipeline
     * @param {string} [uniformName = "Camera"]
     */
    SetRenderPipeline(Pipeline, uniformName = "Camera")
    {
        return this.#MatrixBuffer = (this.#Pipeline = Pipeline).CreateUniformBuffer(
            uniformName, { label: `${this.Label} Matrix Buffer` }
        ).buffer;
    }

    /** @param {Mesh} Mesh */
    GetViewSpaceCenter(Mesh)
    {
        const center = Mesh.GetWorldPosition();
        vec3.transformMat4(center, this.#ViewMatrix, this.#ViewCenter);
        return -this.#ViewCenter[2];
    }

    /** @param {Mesh} Mesh */
    Contains(Mesh)
    {
        // Always render if cull test is disabled:
        if (!Mesh.CullTest) return true;

        const f = this.#Frustum, { Radius, WorldMatrix: m } = Mesh;

        // Bounding Sphere Test:
        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
            if ((f[p] * m[12] + f[p + 1] * m[13] + f[p + 2] * m[14] + f[p + 3]) < -Radius)
                return false;

        // Skip AABB test if not explicitly required by this camera or the mesh:
        if (Mesh.CullTest === 1 || this.CullTest === 1) return true;

        const { Min, Max } = Mesh.UpdateBoundingBox();

        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
        {
            const x = f[p], y = f[p + 1], z = f[p + 2];

            const bbx = x < 0 ? Min[0] : Max[0];
            const bby = y < 0 ? Min[1] : Max[1];
            const bbz = z < 0 ? Min[2] : Max[2];

            if (x * bbx + y * bby + z * bbz + f[p + 3] < 0)
                return false;
        }

        return true;
    }

    Destroy()
    {
        this.#MatrixBuffer?.destroy();
        this.#Pipeline = void 0;
    }

    get ViewProjectionMatrix()
    {
        return this.#ViewProjectionMatrix;
    }

    get MatrixBuffer()
    {
        return this.#MatrixBuffer;
    }

    /** @param {number} near */
    set Near(near)
    {
        this.#Near = near;
        this.UpdateProjectionMatrix();
    }

    get Near()
    {
        return this.#Near;
    }

    /** @param {number} far */
    set Far(far)
    {
        this.#Far = far;
        this.UpdateProjectionMatrix();
    }

    get Far()
    {
        return this.#Far;
    }
}
