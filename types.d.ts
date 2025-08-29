/// <reference types="./global" />
/// <reference types="vite/client" />
/// <reference types="wgpu-matrix" />
/// <reference types="@webgpu/types" />
/// <reference types="vite-plugin-glsl/ext" />

import OrthographicCamera from "./types/cameras/OrthographicCamera";
import PerspectiveCamera from "./types/cameras/PerspectiveCamera";
import { USAGE, BLEND_STATE } from "./types/pipelines/Constants";
import * as TEXTURE from "./types/textures/Constants";
import { GPUTiming, MathUtils } from "./types/utils";
import CubeGeometry from "./types/geometries/Cube";
import SHAPE from "./types/primitives/Constants";
import Camera2D from "./types/cameras/Camera2D";
import Shape from "./types/primitives/Shape";
import { ERROR_CAUSE } from "./types/Errors";
import * as Shaders from "./types/shaders";
/** @deprecated `SDFText` will be replaced by `MSDFText`. */
import SDFText from "./types/text/SDFText";
import Device from "./types/Device";
import Color from "./types/Color";

export
{
    OrthographicCamera,
    PerspectiveCamera,
    CubeGeometry,
    Shape, SHAPE,
    BLEND_STATE,
    ERROR_CAUSE,
    GPUTiming,
    MathUtils,
    Camera2D,
    /** @deprecated `SDFText` will be replaced by `MSDFText`. */
    SDFText,
    TEXTURE,
    Shaders,
    Device,
    USAGE,
    Color
};

// Global types:
export type
{
    ComputePipeline,
    RenderPipeline,
    Computation,
    Renderer
};
