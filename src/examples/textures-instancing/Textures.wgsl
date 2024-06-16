struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f
};

@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;

@vertex fn mainVertex(
    @location(0) position: vec2f,
    @location(1) translation: vec2f
) -> VertexOutput
{
    var output: VertexOutput;
    let clipSpace = GetVertexClipSpace(position).xy;

    output.position = vec4f(clipSpace + translation, 0, 1);
    output.textureCoord = clipSpace * 2.5 + 0.5;

    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoord);
}
