import { mat4 } from "wgpu-matrix";

/** @abstract */ export default class Camera
{
    /** @protected */ Matrix = mat4.identity();

    get Matrix()
    {
        return this.Matrix;
    }
}
