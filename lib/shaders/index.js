import Color from "./Color.frag.wgsl";
import ColorMap from "./Color.map.wgsl";
import MeshVertex from "./Mesh.vert.wgsl";
import ShapeVertex from "./Shape.vert.wgsl";
import EmissiveColor from "./Emissive.wgsl";
import EmissiveMap from "./Emissive.map.wgsl";
import EmissiveNone from "./Emissive.none.wgsl";
import MeshVertexInstance from "./Mesh.inst.wgsl";
import ShapeVertexInstance from "./Shape.inst.wgsl";

export { default as Empty } from "./Empty.wgsl";
export { default as Light } from "./Light.wgsl";
export { default as Camera } from "./Camera.wgsl";
export { default as Mipmaps } from "./Mipmaps.wgsl";
export { default as MSDFText } from "./MSDFText.wgsl";
export { default as Fullscreen } from "./Fullscreen.wgsl";
export { default as EmissiveColor } from "./Emissive.wgsl";
export { default as EmissiveMap } from "./Emissive.map.wgsl";
export { default as EmissiveNone } from "./Emissive.none.wgsl";

export const Mesh = `${MeshVertex}\n\n${Color}`;
export const Shape = `${ShapeVertex}\n\n${Color}`;
export const MeshInstance = `${MeshVertexInstance}\n\n${Color}`;
export const ShapeInstance = `${ShapeVertexInstance}\n\n${Color}`;
export const Emissive = { None: EmissiveNone, Color: EmissiveColor, Map: EmissiveMap };

export
{
    Color,
    ColorMap,
    MeshVertex,
    ShapeVertex,
    MeshVertexInstance,
    ShapeVertexInstance
};
