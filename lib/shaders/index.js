import ShapeVertex from "#/shaders/Shape.vert.wgsl";
import ShapeFragment from "#/shaders/Shape.frag.wgsl";

export { default as Empty } from "#/shaders/Empty.wgsl";
export { default as Mipmaps } from "#/shaders/Mipmaps.wgsl";
export { default as Quad } from "#/shaders/Quad.wgsl";
export { default as Resolution } from "#/shaders/Resolution.wgsl";
export { default as SDFTextDSB } from "#/shaders/SDFText.dsb.wgsl";
export { default as SDFText } from "#/shaders/SDFText.wgsl";

export const Shape = `${ShapeVertex}\n\n${ShapeFragment}`;
export { ShapeVertex, ShapeFragment };
