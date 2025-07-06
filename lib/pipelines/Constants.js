import { CreateConstantObject } from "#/utils";

/** @type {Readonly<Record<"UNIFORM", GPUBufferUsageFlags>>} */
export const USAGE = /*#__PURE__*/ CreateConstantObject(
{
    INDEX:    GPUBufferUsage.INDEX     | GPUBufferUsage.COPY_DST,
    VERTEX:   GPUBufferUsage.VERTEX    | GPUBufferUsage.COPY_DST,
    STORAGE:  GPUBufferUsage.STORAGE   | GPUBufferUsage.COPY_DST,
    UNIFORM:  GPUBufferUsage.UNIFORM   | GPUBufferUsage.COPY_DST,
    READABLE: GPUBufferUsage.MAP_READ  | GPUBufferUsage.COPY_DST,
    WRITABLE: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
});
