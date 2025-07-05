/// <reference types="./typings" />

import OrthographicCamera from "./types/cameras/OrthographicCamera";
import PerspectiveCamera from "./types/cameras/PerspectiveCamera";
import { BLEND_STATE } from "./types/legacy/Constants";
import * as TEXTURE from "./types/textures/Constants";
import CubeGeometry from "./types/geometries/Cube";
import Camera2D from "./types/cameras/Camera2D";
import SHAPE from "./types/shapes/Constants";
import { ERROR_CAUSE } from "./types/Errors";
import * as Shaders from "./types/shaders";
import SDFText from "./types/text/SDFText";
import GPUTiming from "#/utils/GPUTiming";
import Shape from "./types/shapes/Shape";
import Device from "./types/Device";
import Color from "./types/Color";

/** @deprecated Use `CubeGeometry` instead. */
const Geometries = { Cube: CubeGeometry };

import
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    SmootherStep,
    SmoothStep
}
from "#/utils";

const Utils =
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    SmootherStep,
    SmoothStep,
    GPUTiming
};

export type
{
    ConfigurationOptions,
    LegacyComputation,
    LegacyRenderer
}
from "./types/Device";

export {
    OrthographicCamera,
    PerspectiveCamera,
    Shape, SHAPE,
    CubeGeometry,
    BLEND_STATE,
    ERROR_CAUSE,
    /** @deprecated Use `CubeGeometry` instead. */
    Geometries,
    Camera2D,
    SDFText,
    TEXTURE,
    Shaders,
    Device,
    Color,
    Utils
};

/** @deprecated Use `Device` interface instead. */
export const UWAL = Device;
