@group(1) @binding(1) var BackgroundTexture: texture_2d<f32>;
@group(1) @binding(2) var BackgroundSampler: sampler;
@group(1) @binding(3) var<uniform> TexureOffset: vec2f;

@fragment fn fragment(input: TextVertexOutput) -> @location(0) vec4f
{
    var backgroundUV = TexureOffset * input.screenUV;
    let textureSize = vec2f(textureDimensions(StorageTexture));
    backgroundUV = vec2f(backgroundUV.x / 2 + 0.5, 1 - backgroundUV.y - 0.5);

    // A little imprecise, but does not require the use of input.screenUV:
    // let backgroundUV = input.position.xy / textureSize;
    var textureUV = /* backgroundUV */ input.screenUV;

    // Remove if textureUV == backgroundUV:
    textureUV = (textureUV + 1) / 2; textureUV.y = 1 - textureUV.y;

    let coverage = GetSubpixelCoverage(input.inverseTexureSize, input.distanceDelta, input.fontUV);
    let background = textureSample(BackgroundTexture, BackgroundSampler, backgroundUV).rgb;
    var color = vec4f(mix(background, Font.color.rgb, coverage), 1);

    let storageUV = vec2u(textureUV * textureSize);
    textureStore(StorageTexture, storageUV, color);

    return vec4f(color.rgb, 1);
}
