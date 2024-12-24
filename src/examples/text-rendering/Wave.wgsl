struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f
};

@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;

@vertex fn vertex(@location(0) position: vec2f) -> VertexOutput
{
    var output: VertexOutput;
    let aspect = resolution / resolution.y;
    let clipSpace = GetVertexClipSpace(position).xy;

    output.position = vec4f(clipSpace, 0, 1);
    output.textureCoord = (clipSpace + 1) / 2;
    output.textureCoord = output.textureCoord + clipSpace * 2 * aspect;

    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoord);
}
