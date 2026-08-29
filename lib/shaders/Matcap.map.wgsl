#include "Matcap.frag.wgsl";

@group(0) @binding(41) var colorMap: texture_2d<f32>;
@group(0) @binding(42) var mapSampler: sampler;

@fragment fn fragmentNormalMap(
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> @location(0) vec4f
{
    // let viewDirection = GetViewDirection(worldPosition);
    // let matcapUV = GetMatcapUV(viewDirection, normal);

    let map = textureSample(colorMap, mapSampler, uv) * color;
    return vec4f(map.rgb + GetEmissiveColor(uv), map.a);
}
