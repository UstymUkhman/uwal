#include "Color.frag.wgsl";

fn GetViewDirection(worldPosition: vec3f) -> vec3f
{
    return normalize(-(CameraMatrix.view * vec4f(worldPosition, 1.0)).xyz);
}

fn GetMatcapUV(viewDirection: vec3f, normal: vec3f) -> vec2f
{
    let x = normalize(vec3f(viewDirection.z, 0, -viewDirection.x));
	return vec2f(dot(x, normal), dot(cross(viewDirection, x), normal)) * 0.495 + 0.5;
}

@fragment fn fragmentNormal(
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f
) -> @location(0) vec4f
{
    let viewDirection = GetViewDirection(worldPosition);
    let matcapUV = GetMatcapUV(viewDirection, normal);

    // return vec4f(color.rgb + GetEmissiveColor(vec2f(0)), color.a);
    return vec4f(matcapUV, 0, color.a);
}

@fragment fn fragmentNormalUV(
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> @location(0) vec4f
{
    // let viewDirection = GetViewDirection(worldPosition);
    // let matcapUV = GetMatcapUV(viewDirection, normal);

    return vec4f(color.rgb + GetEmissiveColor(uv), color.a);
}
