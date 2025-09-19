struct VertexOutput
{
    @location(0) textureCoords: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(1) var Sampler: sampler;
@group(0) @binding(2) var Texture: texture_2d<f32>;

@vertex fn cubeVertex(@location(0) position: vec4f, @location(1) textureCoords: vec2f) -> VertexOutput
{
    return VertexOutput(textureCoords, GetVertexClipSpace(position));
}

@fragment fn cubeFragment(@location(0) textureCoords: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoords);
}
