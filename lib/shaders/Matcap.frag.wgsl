#include "Normals.wgsl";
#include "Color.frag.wgsl";

override USE_NORMAL_MAP = false;

@group(0) @binding(48) var matcapMap: texture_2d<f32>;
@group(0) @binding(49) var matcapSampler: sampler;

fn GetMatcapUV(direction: vec3f, normal: vec3f) -> vec2f
{
    let x = normalize(vec3f(direction.z, 0, -direction.x));
    // `0.495` is used to remove artifacts caused by undersized matcap disks:
	return vec2f(dot(x, normal), dot(cross(direction, x), normal)) * 0.495 + 0.5;
}

@fragment fn fragmentMatcap(
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) viewNormal: vec3f
) -> @location(0) vec4f
{
    let normal = select(
        normalize(viewNormal), normalize(
            GetCameraNormalMatrix() *
            GetFlatFaceNormal(worldPosition)
        ), USE_FLAT_SHADED
    );

    let matcapUV = GetMatcapUV(normalize(viewPosition), normal);
    let matcap = textureSample(matcapMap, matcapSampler, matcapUV);
    return vec4f(matcap.rgb * color.rgb + GetEmissiveColor(vec2f(0)), color.a);
}

@fragment fn fragmentMatcapUV(
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) worldNormal: vec3f,
    @location(3) uv: vec2f
) -> @location(0) vec4f
{
    var normal = select(
        GetViewNormal(worldNormal, worldPosition),
        GetWorldNormal(worldNormal, worldPosition),
        USE_NORMAL_MAP
    );

    if (USE_NORMAL_MAP)
    {
        let tbn = GetTangentBitangentNormalBasis(worldPosition, uv, normal);
        normal = normalize(GetCameraNormalMatrix() * normalize(tbn * GetNormalMap(uv)));
    }

    let matcapUV = GetMatcapUV(normalize(viewPosition), normal);
    let matcap = textureSample(matcapMap, matcapSampler, matcapUV);
    return vec4f(matcap.rgb * color.rgb + GetEmissiveColor(uv), color.a);
}
