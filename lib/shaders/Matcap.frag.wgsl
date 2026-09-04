#include "Normals.wgsl";
#include "Color.frag.wgsl";

override FLAT_SHADED = false;

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
    let matcapUV = GetMatcapUV(normalize(viewPosition), normalize(viewNormal));
    let matcap = textureSample(matcapMap, matcapSampler, matcapUV).rgb;
    var output = matcap.rgb * color.rgb + GetEmissiveColor(vec2f(0));

    if (FLAT_SHADED)
    {
        output *= GetFlatFaceNormal(worldPosition);
    }

    return vec4f(output, color.a);
}

@fragment fn fragmentMatcapUV(
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) viewNormal: vec3f,
    @location(3) uv: vec2f
) -> @location(0) vec4f
{
    let matcapUV = GetMatcapUV(normalize(viewPosition), normalize(viewNormal));
    let matcap = textureSample(matcapMap, matcapSampler, matcapUV).rgb;
    var output = matcap.rgb * color.rgb + GetEmissiveColor(uv);

    if (FLAT_SHADED)
    {
        output *= GetFlatFaceNormal(worldPosition);
    }

    return vec4f(output, color.a);
}
