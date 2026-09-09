override USE_FLAT_SHADED = false;

@group(0) @binding(46) var normalMap: texture_2d<f32>;
@group(0) @binding(47) var normalSampler: sampler;

// Get the flat shaded face normal.
fn GetFlatFaceNormal(worldPosition: vec3f) -> vec3f
{
    let fdy = dpdy(worldPosition);
    let fdx = dpdx(worldPosition);

    return normalize(cross(fdy, fdx));
}

// Get mesh normals in view space.
fn GetViewNormal(worldNormal: vec3f, worldPosition: vec3f) -> vec3f
{
    let cameraNormal = GetCameraNormalMatrix();

    return normalize(select(
        cameraNormal * normalize(worldNormal),
        cameraNormal * GetFlatFaceNormal(worldPosition),
        USE_FLAT_SHADED
    ));
}

// Get mesh normals in world space.
fn GetWorldNormal(worldNormal: vec3f, worldPosition: vec3f) -> vec3f
{
    return select(
        normalize(worldNormal),
        GetFlatFaceNormal(worldPosition),
        USE_FLAT_SHADED
    );
}

// Sample and normalize the normal map.
fn GetNormalMap(uv: vec2f) -> vec3f
{
    return normalize(textureSample(normalMap, normalSampler, uv).rgb * 2 - 1);
}

// Transform the normal map value from tangent space into world space.
fn GetTangentBitangentNormalBasis(worldPosition: vec3f, uv: vec2f, normal: vec3f) -> mat3x3f
{
    let fdx = dpdx(worldPosition);
    let fdy = dpdy(worldPosition);

    let uvdx = dpdx(uv);
    let uvdy = dpdy(uv);

    var tangent = normalize(fdx * uvdy.y - fdy * uvdx.y);
    tangent = normalize(tangent - normal * dot(normal, tangent));

    let bitangent = normalize(cross(normal, tangent));
    return mat3x3f(tangent, bitangent, normal);
}
