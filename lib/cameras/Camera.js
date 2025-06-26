import { mat4 } from "wgpu-matrix";

/** @abstract */ export default class Camera
{
    /** @protected */ Matrix = mat4.identity();
    /** @protected */ Projection = mat4.identity();

    get Matrix()
    {
        return this.Matrix;
    }

    get Projection()
    {
        return this.Projection;
    }
}
