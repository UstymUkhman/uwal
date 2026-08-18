@group(0) @binding(32) var<uniform> emissiveColor: vec4f;

// Calculate the emissive color of the material:
fn GetEmissiveColor() -> vec3f
{
    return emissiveColor.rgb * emissiveColor.w;
}

@fragment fn fragmentEmissive() -> @location(0) vec4f
{
    return vec4f(color.rgb + GetEmissiveColor(), color.a);
}
