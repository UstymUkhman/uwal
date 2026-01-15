@group(0) @binding(2) var<uniform> mode: f32;
@group(0) @binding(3) var Sampler: sampler;
@group(0) @binding(4) var Texture: texture_2d<f32>;

@group(1) @binding(0) var<uniform> DirectionalLight: LightUniforms;

@fragment fn baseFragment(mesh: MeshVertexNormalUV) -> @location(0) vec4f
{
    var rgb = color.rgb;

    // Texture:
    if (mode == 0)
    {
        rgb = textureSample(Texture, Sampler, mesh.uv).rgb;
    }

    // Normal:
    if (mode == 1)
    {
        rgb = vec3f(mesh.normal * 0.5 + 0.5);
    }

    // Flat Shaded:
    if (mode == 2)
    {
        let fdx = vec3f(dpdx(mesh.worldPosition.x), dpdx(mesh.worldPosition.y), dpdx(mesh.worldPosition.z));
        let fdy = vec3f(dpdy(mesh.worldPosition.x), dpdy(mesh.worldPosition.y), dpdy(mesh.worldPosition.z));
        rgb = normalize(cross(fdx, fdy)) * 0.5 + 0.5;
    }

    // UV:
    if (mode == 3)
    {
        rgb = vec3f(mesh.uv, 0);
    }

    let directionalLight = GetDirectionalLight(DirectionalLight.direction, mesh.normal);
    return vec4f(rgb * directionalLight * DirectionalLight.intensity, 1);
}
