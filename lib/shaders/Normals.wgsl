// Calculate the face normal used in flat shading:
fn GetFlatFaceNormal(worldPosition: vec3f) -> vec3f
{
    let fdy = dpdy(worldPosition);
    let fdx = dpdx(worldPosition);

    return normalize(cross(fdy, fdx));
}
