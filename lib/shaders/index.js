import MeshVertex from "./Mesh.vert.wgsl";
import ShapeVertex from "./Shape.vert.wgsl";
import MeshFragment from "./Mesh.frag.wgsl";
import ShapeFragment from "./Shape.frag.wgsl";
import MeshVertexInstance from "./Mesh.inst.wgsl";
import ShapeVertexInstance from "./Shape.inst.wgsl";

export { default as Empty } from "./Empty.wgsl";
export { default as Light } from "./Light.wgsl";
export { default as Camera } from "./Camera.wgsl";
export { default as Mipmaps } from "./Mipmaps.wgsl";
export { default as MSDFText } from "./MSDFText.wgsl";
export { default as Fullscreen } from "./Fullscreen.wgsl";

export const Mesh = `${MeshVertex}\n\n${MeshFragment}`;
export const Shape = `${ShapeVertex}\n\n${ShapeFragment}`;
export const MeshInstance = `${MeshVertexInstance}\n\n${MeshFragment}`;
export const ShapeInstance = `${ShapeVertexInstance}\n\n${ShapeFragment}`;

export
{
    MeshVertex,
    ShapeVertex,
    MeshFragment,
    ShapeFragment,
    MeshVertexInstance,
    ShapeVertexInstance
};
