/// <reference types="./global" />
/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

import OrthographicCamera from "./types/cameras/OrthographicCamera";
import PerspectiveCamera from "./types/cameras/PerspectiveCamera";
import { USAGE, BLEND_STATE } from "./types/pipelines/Constants";
import * as TEXTURE from "./types/textures/Constants";
import CubeGeometry from "./types/geometries/Cube";
import GPUTiming from "./types/utils/GPUTiming";
import Camera2D from "./types/cameras/Camera2D";
import SHAPE from "./types/shapes/Constants";
import { ERROR_CAUSE } from "./types/Errors";
import * as Shaders from "./types/shaders";
/** @deprecated `SDFText` will be replaced by `MSDFText`. */
import SDFText from "./types/text/SDFText";
import Shape from "./types/shapes/Shape";
import Device from "./types/Device";
import Color from "./types/Color";

import
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    SmootherStep,
    SmoothStep
}
from "./types/utils";

const Utils =
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    SmootherStep,
    SmoothStep,
    GPUTiming
};

// Global types:
export type
{
    ComputePipeline,
    RenderPipeline,
    Computation,
    Renderer
};

export {
    OrthographicCamera,
    PerspectiveCamera,
    CubeGeometry,
    Shape, SHAPE,
    BLEND_STATE,
    ERROR_CAUSE,
    Camera2D,
    /** @deprecated `SDFText` will be replaced by `MSDFText`. */
    SDFText,
    TEXTURE,
    Shaders,
    Device,
    USAGE,
    Color,
    Utils
};
