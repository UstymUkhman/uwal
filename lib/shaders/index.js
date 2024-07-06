import ShapeVertex from "@/shaders/Shape.vert.wgsl";
import ShapeFragmen from "@/shaders/Shape.frag.wgsl";

export { default as Mipmaps } from "@/shaders/Mipmaps.wgsl";
export { default as Quad } from "@/shaders/Quad.wgsl";
export { default as Resolution } from "@/shaders/Resolution.wgsl";

export const Shape = `${ShapeVertex}\n\n${ShapeFragmen}`;
export { ShapeVertex, ShapeFragmen };
