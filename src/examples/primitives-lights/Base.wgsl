@group(0) @binding(2) var<uniform> mode: f32;
@group(0) @binding(3) var Sampler: sampler;
@group(0) @binding(4) var Texture: texture_2d<f32>;

@fragment fn baseFragment(mesh: MeshVertexNormalUV) -> @location(0) vec4f
{
    // Texture:
    if (mode == 0)
    {
        return textureSample(Texture, Sampler, mesh.uv);
    }

    // Normal:
    if (mode == 1)
    {
        return vec4f(mesh.normal * 0.5 + 0.5, 1);
    }

    // Flat Shaded:
    if (mode == 2)
    {
        let fdx = vec3f(dpdx(mesh.worldPosition.x), dpdx(mesh.worldPosition.y), dpdx(mesh.worldPosition.z));
        let fdy = vec3f(dpdy(mesh.worldPosition.x), dpdy(mesh.worldPosition.y), dpdy(mesh.worldPosition.z));
        let color = normalize(cross(fdx, fdy));
        return vec4f(color * 0.5 + 0.5, 1);
    }

    // UV:
    if (mode == 3)
    {
        return vec4f(mesh.uv, 0, 1);
    }

    // Fallback (Wireframe):
    return color;
}
