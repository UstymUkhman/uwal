/// <reference types="../typings" />

export * as Primitives from "@/primitives";
export { default as Color } from "@/Color";
export { BLEND_STATE } from "@/pipelines";
export { default as UWAL } from "@/UWAL";
export { Shape, SHAPE } from "@/shapes";
export { ERROR_CAUSE } from "@/Errors";
export * as Shaders from "@/shaders";
export { TEXTURE } from "@/textures";

import
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    GPUTiming
}
from "@/utils";

export const Utils =
{
    DegreesToRadians,
    RadiansToDegrees,
    EuclideanModulo,
    GPUTiming
};

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
