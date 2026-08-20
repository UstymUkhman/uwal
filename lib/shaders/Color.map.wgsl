#include "Color.frag.wgsl";

@group(0) @binding(41) var colorMap: texture_2d<f32>;
@group(0) @binding(42) var mapSampler: sampler;

@fragment fn fragmentMap(@location(1) uv: vec2f) -> @location(0) vec4f
{
    let map = textureSample(colorMap, mapSampler, uv) * color;
    return vec4f(map.rgb + GetEmissiveColor(uv), map.a);
}
