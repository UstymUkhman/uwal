import Empty from "#/shaders/Empty.wgsl";
import Mipmaps from "#/shaders/Mipmaps.wgsl";
import Quad from "#/shaders/Quad.wgsl";
import Resolution from "#/shaders/Resolution.wgsl";
/** @deprecated `SDFText` will be replaced by `MSDFText`. */
import SDFTextDSB from "#/shaders/SDFText.dsb.wgsl";
import SDFText from "#/shaders/SDFText.wgsl";
import ShapeVertex from "#/shaders/Shape.vert.wgsl";
import ShapeFragment from "#/shaders/Shape.frag.wgsl";

export const Shape = `${ShapeVertex}\n\n${ShapeFragment}`;
export { Empty, Mipmaps, Quad, Resolution, SDFTextDSB, SDFText, ShapeVertex, ShapeFragment };
