import { mat4 } from "wgpu-matrix";

/** @abstract */ export default class Camera
{
    /** @protected */ Matrix = mat4.identity();
    /** @protected */ Projection = mat4.identity();

    ResetProjection()
    {
        this.Projection = mat4.identity();
        return this;
    }

    ResetMatrix()
    {
        this.Matrix = mat4.identity();
        return this;
    }

    get Matrix()
    {
        return this.Matrix;
    }

    get Projection()
    {
        return this.Projection;
    }
}
