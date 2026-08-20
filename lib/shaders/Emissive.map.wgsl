@group(0) @binding(43) var<uniform> emissiveColor: vec4f;
@group(0) @binding(44) var emissiveMap: texture_2d<f32>;
@group(0) @binding(45) var emissiveSampler: sampler;

fn GetEmissiveColor(uv: vec2f) -> vec3f
{
    let color = emissiveColor.rgb * emissiveColor.w;
    return textureSample(emissiveMap, emissiveSampler, uv).rgb * color;
}
