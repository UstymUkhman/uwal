import { mat3 } from "wgpu-matrix";
import Camera from "#/cameras/Camera";

export default class Camera2D extends Camera
{
    /** @protected */ Matrix = mat3.identity();
}
