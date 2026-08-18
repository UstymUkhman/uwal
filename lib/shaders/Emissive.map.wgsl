#include "Emissive.wgsl";

@group(0) @binding(33) var emissiveMap: texture_2d<f32>;
@group(0) @binding(34) var emissiveSampler: sampler;

@fragment fn fragmentEmissiveMap(@location(1) uv: vec2f) -> @location(0) vec4f
{
    let emissive = textureSample(emissiveMap, emissiveSampler, uv).rgb;
    return vec4f(color.rgb + GetEmissiveColor() * emissive, color.a);
}
