/** @module Camera3D */

import { Node } from "#/primitives/Node";
import { vec3, mat4, quat } from "wgpu-matrix";
import { CopyMat4Rotation, GetMat4Rotation } from "#/utils/Math";

/**
 * Base class for [orthographic](./OrthographicCamera) and [perspective](./PerspectiveCamera) cameras.
 *
 * @abstract
 * @noInheritDoc
 */
export class Camera3D extends Node
{
    /**
     * @import {Vec3, Mat4, Quat} from "wgpu-matrix"
     * @typedef {import("../primitives").Mesh} Mesh
     */

    /**
     * Defaults to bounding sphere.
     *
     * @typedef {import("../primitives/Mesh").CullTest} CullTest
     * @type {CullTest[keyof CullTest]}
     */
    CullTest = 1;

    /**
     * Update the camera's view projection matrix every time the world matrix is updated.
     *
     * @type {boolean}
     */
    AutoUpdateWorldMatrix = false;

    /** @type {number} */ #Near = 1;
    /** @type {number} */ #Far = 1e3;

    /**
     * @hidden
     * @protected
     * @type {Mat4}
     */
    ProjectionMatrix = mat4.identity();

    /** @type {Vec3} */ #Up = vec3.set(0, 1, 0);
    /** @type {Quat} */ #Rotation = quat.create();
    /** @type {Vec3} */ #ViewCenter = vec3.create();
    /** @type {Mat4} */ #ViewMatrix = mat4.identity();

    /** @type {GPUBuffer | undefined} */ #MatrixBuffer;
    /** @type {RenderPipeline | undefined} */ #Pipeline;
    /** @type {Quat} */ #ParentRotation = quat.create();

    /** @type {Mat4} */ #RotationMatrix = mat4.identity();
    /** @type {Mat4} */ #ViewProjectionMatrix = mat4.identity();
    /** @type {Float32Array} */ #Frustum = new Float32Array(24);

    /**
     * @param {number} [near = 1] - Distance to the near plane.
     * @param {number} [far = 1000] - Distance to the far plane.
     * @param {string} [label] - Camera name.
     */
    constructor(near = 1, far = 1e3, label)
    {
        super(label);

        this.#Near = near;
        this.#Far = far;
    }

    /**
     * @see {@link https://www8.cs.umu.se/kurser/5DV051/HT12/lab/plane_extraction.pdf}
     */
    #UpdateFrustumPlanes()
    {
        const [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ] = this.#ViewProjectionMatrix;

        // Left Plane
        this.#Frustum[ 0] = m03 - m00;
        this.#Frustum[ 1] = m13 - m10;
        this.#Frustum[ 2] = m23 - m20;
        this.#Frustum[ 3] = m33 - m30;

        // Right Plane
        this.#Frustum[ 4] = m03 + m00;
        this.#Frustum[ 5] = m13 + m10;
        this.#Frustum[ 6] = m23 + m20;
        this.#Frustum[ 7] = m33 + m30;

        // Top Plane
        this.#Frustum[ 8] = m03 + m01;
        this.#Frustum[ 9] = m13 + m11;
        this.#Frustum[10] = m23 + m21;
        this.#Frustum[11] = m33 + m31;

        // Bottom Plane
        this.#Frustum[12] = m03 - m01;
        this.#Frustum[13] = m13 - m11;
        this.#Frustum[14] = m23 - m21;
        this.#Frustum[15] = m33 - m31;

        // Far Plane
        this.#Frustum[16] = m03 - m02;
        this.#Frustum[17] = m13 - m12;
        this.#Frustum[18] = m23 - m22;
        this.#Frustum[19] = m33 - m32;

        // Near Plane
        this.#Frustum[20] = m03 + m02;
        this.#Frustum[21] = m13 + m12;
        this.#Frustum[22] = m23 + m22;
        this.#Frustum[23] = m33 + m32;

        // Normalize all planes distances.
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

    #UpdateViewProjectionBuffer()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.#ViewProjectionMatrix), 128
        );
    }

    /**
     * @override
     * Update the camera's world matrix buffer.
     * When the [AutoUpdateWorldMatrix](#autoupdateworldmatrix) or `force` is `true`,
     * the camera's world and view projection matrices are also updated.
     *
     * @param {boolean} [force = false] - Force the camera's matrices to be updated.
     */
    UpdateWorldMatrix(force = false)
    {
        if (!this.AutoUpdateWorldMatrix && !force)
            return this.#UpdateWorldMatrixBuffer();

        this.Parent && super.UpdateWorldMatrix();
        this.UpdateViewProjectionMatrix(false);
        this.#UpdateWorldMatrixBuffer();
    }

    /**
     * Write the computed projection matrix into the corresponding uniform buffer if present.
     */
    UpdateProjectionMatrix()
    {
        this.#Pipeline?.WriteBuffer(
            /** @type {GPUBuffer} */ (this.#MatrixBuffer),
            /** @type {GPUAllowSharedBufferSource} */ (this.ProjectionMatrix), 64
        );
    }

    /**
     * Compute the view-projection matrix and write the result into the corresponding uniform buffer if present.
     * This method also updates the camera's frustum planes used in cull testing.
     *
     * @param {boolean} [updateWorldMatrix = true] - Update the camera's world matrix.
     */
    UpdateViewProjectionMatrix(updateWorldMatrix = true)
    {
        const { Parent, WorldMatrix, LocalMatrix } = this;

        !updateWorldMatrix ? mat4.inverse(WorldMatrix, this.#ViewMatrix) : mat4.inverse(
            // If the camera has a parent element, update and invert its world matrix;
            // othervise use the camera's local matrix if it hasn't been added to the scene yet.
            // Unlike in `super.UpdateWorldMatrix`, the camera's local matrix and its children won't be updated.
            Parent && mat4.multiply(Parent.WorldMatrix, LocalMatrix, WorldMatrix) || LocalMatrix, this.#ViewMatrix
        );

        mat4.multiply(this.ProjectionMatrix, this.#ViewMatrix, this.#ViewProjectionMatrix);

        this.#UpdateFrustumPlanes();
        this.#UpdateViewProjectionBuffer();

        return this.#ViewProjectionMatrix;
    }

    /**
     * Compute the inverse of the camera's view-projection matrix.
     * Optionally, reset the translation component of the matrix before inverting it.
     * @see [SkyBox](https://ustymukhman.github.io/uwal/dist/lessons/lessons.html#skybox) lesson for reference.
     *
     * @param {Vec3} [translation] - If passed, set the matrix translation to this vector.
     * @param {Mat4} [dst] - Destination matrix. A new one is created if omitted.
     */
    GetInverseViewProjectionMatrix(translation, dst = mat4.identity())
    {
        mat4.copy(this.#ViewProjectionMatrix, dst);

        translation && mat4.setTranslation(dst, translation, dst);

        return mat4.inverse(dst, dst);
    }

    /**
     * Rotate the camera to point at the specified point in 3D space.
     *
     * @param {Vec3} target - Point in 3D space to look at.
     * @param {Vec3} [up = [0, 1, 0]] - Camera's *up* vector. Defaults to `[0, 1, 0]`.
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
            CopyMat4Rotation(this.Parent.WorldMatrix, this.#RotationMatrix);
            quat.fromMat(this.#RotationMatrix, this.#ParentRotation);
            quat.inverse(this.#ParentRotation, this.#ParentRotation);
            quat.multiply(this.#ParentRotation, this.#Rotation, this.#Rotation);
        }

        mat4.fromQuat(this.#Rotation, this.#RotationMatrix);
        GetMat4Rotation(this.#RotationMatrix, this.Rotation, this.RotationOrder);
    }

    /**
     * Create and update an internal uniform buffer of this camera's world, projection, and view-projection matrices.
     *
     * @param {RenderPipeline} Pipeline - Pipeline using this camera's projection.
     */
    SetRenderPipeline(Pipeline)
    {
        this.#MatrixBuffer = (this.#Pipeline = Pipeline).CreateUniformBuffer(
            "CameraMatrix", { label: `${this.Label} Matrix Buffer` }
        ).buffer;

        this.UpdateProjectionMatrix();
        this.#UpdateWorldMatrixBuffer();
        this.#UpdateViewProjectionBuffer();

        return this.#MatrixBuffer;
    }

    /**
     * @hidden
     * Compute the view distance to the mesh.
     *
     * @param {Mesh} Mesh - Target mesh to calculate the distance to.
     */
    GetViewSpaceCenter(Mesh)
    {
        const center = Mesh.GetWorldPosition();
        vec3.transformMat4(center, this.#ViewMatrix, this.#ViewCenter);
        return -this.#ViewCenter[2];
    }

    /**
     * Check if a mesh is contained in the camera's frustum when cull testing is performed.
     * This method is called internally on every render when cull testing is enabled.
     *
     * @param {Mesh} Mesh - 3D mesh to test for culling.
     * @returns {boolean} Whether the mesh is in the camera's frustum.
     */
    Contains(Mesh)
    {
        // Always render if cull testing is disabled.
        if (!Mesh.CullTest) return true;

        const f = this.#Frustum, { Radius, WorldMatrix: m } = Mesh;

        // Bounding Sphere Test:
        for (let plane = 0, p = 0; plane < 6; p = ++plane * 4)
            if ((f[p] * m[12] + f[p + 1] * m[13] + f[p + 2] * m[14] + f[p + 3]) < -Radius)
                return false;

        // Skip AABB testing if not explicitly required by the camera or the mesh.
        if (Mesh.CullTest === 1 || this.CullTest === 1)
            return true;

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

    /**
     * Destroy the internal matrices buffer.
     */
    Destroy()
    {
        this.#Pipeline = this.#MatrixBuffer?.destroy();
    }

    /**
     * @returns {Mat4} Camera's view projection matrix.
     */
    get ViewProjectionMatrix()
    {
        return this.#ViewProjectionMatrix;
    }

    /**
     * @returns {GPUBuffer | undefined} Matrix buffer created by the [SetRenderPipeline](#setrenderpipeline) method.
     */
    get MatrixBuffer()
    {
        return this.#MatrixBuffer;
    }

    /**
     * @param {number} near - Distance to the near plane.
     */
    set Near(near)
    {
        this.#Near = near;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Distance to the near plane of the frustum.
     */
    get Near()
    {
        return this.#Near;
    }

    /**
     * @param {number} far - Distance to the far plane.
     */
    set Far(far)
    {
        this.#Far = far;
        this.UpdateProjectionMatrix();
    }

    /**
     * @returns Distance to the far plane of the frustum.
     */
    get Far()
    {
        return this.#Far;
    }
}
