@group(0) @binding(31) var<uniform> color: vec4f;

// Calculate the face normal used in flat shading:
fn GetFlatFaceNormal(worldPosition: vec3f) -> vec3f
{
    let fdy = dpdy(worldPosition);
    let fdx = dpdx(worldPosition);

    return normalize(cross(fdy, fdx));
}

@fragment fn fragment() -> @location(0) vec4f
{
    return color;
}
