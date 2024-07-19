export { default as Color } from "@/Color";
export { default as UWAL } from "@/UWAL";
export { Shape, SHAPE } from "@/shapes";
export { ERROR_CAUSE } from "@/Errors";
export * as Shaders from "@/shaders";
export { TEXTURE } from "@/textures";

import
{
    DegreesToRadians,
    RadiansToDegrees
}
from "@/Utils";

export const Utils =
{
    DegreesToRadians,
    RadiansToDegrees
};

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
