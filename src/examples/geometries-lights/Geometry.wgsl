// @group(0) @binding(2) var Sampler: sampler;
// @group(0) @binding(3) var Texture: texture_2d<f32>;

@fragment fn GeometryFragment(mesh: MeshVertexNormalUV) -> @location(0) vec4f
{
    // Texture:
    // return textureSample(Texture, Sampler, mesh.uv);

    // Normal:
    // return vec4f(mesh.normal * 0.5 + 0.5, 1);

    /**
     * Flat Shaded:
     *
        let fdx = vec3f(dpdx(mesh.worldPosition.x), dpdx(mesh.worldPosition.y), dpdx(mesh.worldPosition.z));
        let fdy = vec3f(dpdy(mesh.worldPosition.x), dpdy(mesh.worldPosition.y), dpdy(mesh.worldPosition.z));
        let normal = normalize(cross(fdx, fdy));
        return vec4f(normal * 0.5 + 0.5, 1.0);
     */

    // UV:
    // return vec4f(mesh.uv, 0, 1);

    // Wireframe:
    return color;
}
