@group(0) @binding(43) var<uniform> emissiveColor: vec4f;

fn GetEmissiveColor(uv: vec2f) -> vec3f
{
    return emissiveColor.rgb * emissiveColor.w;
}
