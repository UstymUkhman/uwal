/**
 * @typedef {Object} Primitive
 * @property {Uint16Array | Uint32Array} cells
 * @property {Float32Array} positions
 * @property {Float32Array} [normals]
 * @property {Float32Array} [uvs]
 *
 * @exports Primitive
 */

export {
    box,
    circle,
    quad,
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
