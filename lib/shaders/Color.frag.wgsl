#include "Emissive.none.wgsl";

@group(0) @binding(40) var<uniform> color: vec4f;

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(color.rgb + GetEmissiveColor(vec2f(0)), color.a);
}

@fragment fn fragmentUV(@location(1) uv: vec2f) -> @location(0) vec4f
{
    return vec4f(color.rgb + GetEmissiveColor(uv), color.a);
}
