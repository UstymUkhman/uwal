struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> projection: mat4x4f;

@vertex fn vertex(
    @location(1) textureCoord: vec2f,
    @location(0) position: vec4f
) -> VertexOutput
{
    var output: VertexOutput;

    output.position = projection * position;
    output.textureCoord = textureCoord;
    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoord);
}
