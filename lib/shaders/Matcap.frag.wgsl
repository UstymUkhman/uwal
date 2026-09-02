#include "Normals.wgsl";
#include "Color.frag.wgsl";

override FLAT_SHADED = false;

fn GetViewDirection(worldPosition: vec3f) -> vec3f
{
    return normalize(-(CameraMatrix.view * vec4f(worldPosition, 1.0)).xyz);
}

fn GetMatcapUV(viewDirection: vec3f, normal: vec3f) -> vec2f
{
    let x = normalize(vec3f(viewDirection.z, 0, -viewDirection.x));
    // `0.495` is used to remove artifacts caused by undersized matcap disks:
	return vec2f(dot(x, normal), dot(cross(viewDirection, x), normal)) * 0.495 + 0.5;
}

@fragment fn fragmentNormalUV(
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> @location(0) vec4f
{
    let viewDirection = GetViewDirection(worldPosition);
    let matcapUV = GetMatcapUV(viewDirection, normal);

    let rgb = color.rgb * vec3f(matcapUV, 0);
    var output = rgb + GetEmissiveColor(uv);

    if (FLAT_SHADED)
    {
        output *= GetFlatFaceNormal(worldPosition);
    }

    return vec4f(output, color.a);
}
