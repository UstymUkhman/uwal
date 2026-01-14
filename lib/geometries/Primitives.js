/**
 * @typedef {Object} Primitive
 * @property {Uint16Array | Uint32Array} cells
 * @property {Float32Array} positions
 * @property {Float32Array} [normals]
 * @property {Float32Array} [uvs]
 * @exports Primitive
 */

// Override the quad's normals and uvs to use the
// same vertex shader in all primitive geometries:
import { quad as Quad } from "primitive-geometry";

export const quad = () =>
{
    const Geometry = Quad();

    Geometry.normals = Float32Array.of(
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    );

    Geometry.uvs = Float32Array.of(
        0, 0,
        1, 0,
        1, 1,
        0, 1
    );

    return Geometry;
};

export {
    box,
    circle,
    plane,
    roundedRectangle,
    stadium,
    ellipse,
    disc,
    superellipse,
    squircle,
    annulus,
    reuleux,
    cube,
    roundedCube,
    sphere,
    icosphere,
    ellipsoid,
    cylinder,
    cone,
    capsule,
    torus,
    tetrahedron,
    icosahedron
} from "primitive-geometry";
