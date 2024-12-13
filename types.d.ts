/// <reference types="./typings" />

import { BLEND_STATE } from "./types/pipelines/Constants";
import * as TEXTURE from "./types/textures/Constants";
import SHAPE from "./types/shapes/Constants";
import { ERROR_CAUSE } from "./types/Errors";
import * as Shaders from "./types/shaders";
import SDFText from "./types/text/SDFText";
import Cube from "./types/primitives/Cube";
import GPUTiming from "#/utils/GPUTiming";
import Shape from "./types/shapes/Shape";
import Color from "./types/Color";
import UWAL from "./types/UWAL";

const Primitives = { Cube };

import
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo
}
from "#/utils";

const Utils =
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    GPUTiming
};

export type
{
    ConfigurationOptions,
    Computation,
    Renderer
}
from "./types/UWAL";

export {
    Shape, SHAPE,
    BLEND_STATE,
    ERROR_CAUSE,
    Primitives,
    SDFText,
    TEXTURE,
    Shaders,
    Color,
    Utils,
    UWAL
};
