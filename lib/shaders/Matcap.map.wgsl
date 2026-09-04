#include "Matcap.frag.wgsl";

@group(0) @binding(41) var colorMap: texture_2d<f32>;
@group(0) @binding(42) var mapSampler: sampler;

@fragment fn fragmentMatcapMap(
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) viewNormal: vec3f,
    @location(3) uv: vec2f
) -> @location(0) vec4f
{
    let matcapUV = GetMatcapUV(normalize(viewPosition), normalize(viewNormal));
    let matcap = textureSample(matcapMap, matcapSampler, matcapUV).rgb;

    let albedo = textureSample(colorMap, mapSampler, uv) * color;
    var output = matcap.rgb * albedo.rgb + GetEmissiveColor(uv);

    if (FLAT_SHADED)
    {
        output *= GetFlatFaceNormal(worldPosition);
    }

    return vec4f(output, albedo.a);
}
