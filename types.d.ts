/// <reference types="./typings" />

import * as TEXTURE from "./types/textures/Constants";
import BLEND_STATE from "./types/pipelines/Constants";
import SHAPE from "./types/shapes/Constants";
import { ERROR_CAUSE } from "./types/Errors";
import * as Shaders from "./types/shaders";
import Cube from "./types/primitives/Cube";
import Shape from "./types/shapes/Shape";
import Color from "./types/Color";
import UWAL from "./types/UWAL";

const Primitives = { Cube };

export type
{
    Computation,
    Renderer
}
from "./types/UWAL";

export {
    Shape, SHAPE,
    BLEND_STATE,
    ERROR_CAUSE,
    Primitives,
    TEXTURE,
    Shaders,
    Color,
    UWAL
};
