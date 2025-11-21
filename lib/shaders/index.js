import CubeVertex from "./Cube.vert.wgsl";
import CubeFragment from "./Cube.frag.wgsl";
import Empty from "./Empty.wgsl";
import Fullscreen from "./Fullscreen.wgsl";
import Mipmaps from "./Mipmaps.wgsl";
import MSDFText from "./MSDFText.wgsl";
import Resolution from "./Resolution.wgsl";
import ShapeVertex from "./Shape.vert.wgsl";
import ShapeFragment from "./Shape.frag.wgsl";

export const Cube = `${CubeVertex}\n\n${CubeFragment}`;
export const Shape = `${ShapeVertex}\n\n${ShapeFragment}`;

export {
    CubeVertex,
    CubeFragment,
    Empty,
    Fullscreen,
    Mipmaps,
    MSDFText,
    Resolution,
    ShapeVertex,
    ShapeFragment
};
