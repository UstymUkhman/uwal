@group(0) @binding(40) var<uniform> color: vec4f;

// Calculate the face normal used in flat shading:
fn GetFlatFaceNormal(worldPosition: vec3f) -> vec3f
{
    let fdy = dpdy(worldPosition);
    let fdx = dpdx(worldPosition);

    return normalize(cross(fdy, fdx));
}

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(color.rgb + GetEmissiveColor(vec2f(0)), color.a);
}

@fragment fn fragmentUV(@location(1) uv: vec2f) -> @location(0) vec4f
{
    return vec4f(color.rgb + GetEmissiveColor(uv), color.a);
}
