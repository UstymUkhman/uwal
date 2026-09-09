#include "Matcap.frag.wgsl";

@group(0) @binding(41) var colorMap: texture_2d<f32>;
@group(0) @binding(42) var mapSampler: sampler;

@fragment fn fragmentMatcapMap(
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) worldNormal: vec3f,
    @location(3) uv: vec2f
) -> @location(0) vec4f
{
    let normal = select(
        GetViewNormal(worldNormal, worldPosition),
        GetWorldNormal(worldNormal, worldPosition),
        USE_NORMAL_MAP
    );

    if (USE_NORMAL_MAP)
    {
        let tbn = GetTangentBitangentNormalBasis(worldPosition, uv, normal);
        normal = normalize(GetCameraNormalMatrix() * normalize(tbn * GetNormalMap(uv)));
    }

    let matcapUV = GetMatcapUV(normalize(viewPosition), normal);
    let albedo = textureSample(colorMap, mapSampler, uv) * color;
    let matcap = textureSample(matcapMap, matcapSampler, matcapUV);

    return vec4f(matcap.rgb * albedo.rgb + GetEmissiveColor(uv), albedo.a);
}
