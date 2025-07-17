/// <reference types="./global" />
/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

import OrthographicCamera from "./types/cameras/OrthographicCamera";
import PerspectiveCamera from "./types/cameras/PerspectiveCamera";
import { USAGE, BLEND_STATE } from "./types/pipelines/Constants";
/** @deprecated Use `GPUTiming` instead. */
import LegacyGPUTiming from "./types/utils/LegacyGPUTiming";
/** @deprecated Use `CubeGeometry` instead. */
import LegacyCube from "./types/geometries/LegacyCube";
import * as TEXTURE from "./types/textures/Constants";
/** @deprecated Use `Shape` instead. */
import LegacyShape from "./types/shapes/LegacyShape";
import CubeGeometry from "./types/geometries/Cube";
import GPUTiming from "./types/utils/GPUTiming";
import Camera2D from "./types/cameras/Camera2D";
import SHAPE from "./types/shapes/Constants";
import { ERROR_CAUSE } from "./types/Errors";
import * as Shaders from "./types/shaders";
/** @deprecated Use `MSDFText` instead. */
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
    /** @deprecated Use `GPUTiming` instead. */
    LegacyGPUTiming,
    EuclideanModulo,
    SmootherStep,
    SmoothStep,
    GPUTiming
};

// Global types:
export type
{
    LegacyComputation,
    ComputePipeline,
    LegacyRenderer,
    RenderPipeline,
    Computation,
    Renderer
};

export {
    OrthographicCamera,
    PerspectiveCamera,
    CubeGeometry,
    Shape, SHAPE,
    /** @deprecated Use `Shape` instead. */
    LegacyShape,
    BLEND_STATE,
    ERROR_CAUSE,
    /** @deprecated Use `CubeGeometry` instead. */
    LegacyCube,
    Camera2D,
    /** @deprecated Use `MSDFText` instead. */
    SDFText,
    TEXTURE,
    Shaders,
    Device,
    USAGE,
    Color,
    Utils
};

/** @deprecated Use `Device` interface instead. */
export const UWAL = Device;
