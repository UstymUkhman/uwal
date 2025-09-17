import Empty from "./Empty.wgsl";
import Mipmaps from "./Mipmaps.wgsl";
import Quad from "./Quad.wgsl";
import Resolution from "./Resolution.wgsl";
/** @deprecated `SDFText` will be replaced by `MSDFText`. */
import SDFTextDSB from "./SDFText.dsb.wgsl";
import SDFText from "./SDFText.wgsl";
import CubeVertex from "./Cube.vert.wgsl";
import CubeFragment from "./Cube.frag.wgsl";
import ShapeVertex from "./Shape.vert.wgsl";
import ShapeFragment from "./Shape.frag.wgsl";

export const Cube = `${CubeVertex}\n\n${CubeFragment}`;
export const Shape = `${ShapeVertex}\n\n${ShapeFragment}`;

export {
    Empty,
    Mipmaps,
    Quad,
    Resolution,
    SDFTextDSB,
    SDFText,
    CubeVertex,
    CubeFragment,
    ShapeVertex,
    ShapeFragment
};
