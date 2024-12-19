@group(1) @binding(0) var BackgroundTexture: texture_2d<f32>;
@group(1) @binding(1) var BackgroundSampler: sampler;
@group(1) @binding(2) var<uniform> TexureOffset: vec2f;

@fragment fn fragment(input: TextVertexOutput) -> @location(0) vec4f
{
    var backgroundUV = TexureOffset * input.screenUV;
    backgroundUV = vec2f(backgroundUV.x * 0.5 + 0.5, 1 - backgroundUV.y - 0.5);

    let coverage = GetSubpixelCoverage(input.inverseTexureSize, input.distanceDelta, input.fontUV);
    let background = textureSample(BackgroundTexture, BackgroundSampler, backgroundUV).rgb;
    return vec4f(mix(background, Font.color.rgb, coverage), Font.color.a);
}
