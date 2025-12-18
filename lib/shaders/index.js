import Empty from "./Empty.wgsl";
import Fullscreen from "./Fullscreen.wgsl";
import Light from "./Light.wgsl";
import MSDFText from "./MSDFText.wgsl";
import MeshVertex from "./Mesh.vert.wgsl";
import MeshFragment from "./Mesh.frag.wgsl";
import Mipmaps from "./Mipmaps.wgsl";
import Resolution from "./Resolution.wgsl";
import ShapeVertex from "./Shape.vert.wgsl";
import ShapeFragment from "./Shape.frag.wgsl";

export const Mesh = `${MeshVertex}\n\n${MeshFragment}`;
export const Shape = `${ShapeVertex}\n\n${ShapeFragment}`;

export {
    Empty,
    Fullscreen,
    Light,
    MSDFText,
    MeshVertex,
    MeshFragment,
    Mipmaps,
    Resolution,
    ShapeVertex,
    ShapeFragment
};
