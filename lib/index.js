import { DegreesToRadians } from "@/Utils";

export { default as Color } from "@/Color";
export { default as UWAL } from "@/UWAL";
export { Shape, SHAPE } from "@/shapes";
export { ERROR_CAUSE } from "@/Errors";
export * as Shaders from "@/shaders";
export { TEXTURE } from "@/textures";

export const Utils =
{
    DegreesToRadians
};

console.info(`%cUWAL v${VERSION}`, "background:#005a9c;padding:3px;color:#fff;");
