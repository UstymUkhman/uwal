struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Background: texture_2d<f32>;
@group(0) @binding(2) var Storage: texture_2d<f32>;
@group(0) @binding(3) var<uniform> offset: vec2f;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let position = GetQuadCoord(index);
    let coord = (position + 1) * 0.5;
    var output: VertexOutput;

    output.textureCoord = vec2f(coord.x, 1 - coord.y) + offset * sign(position);
    output.position = vec4f(position, 0, 1);
    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    let backgroundColor = textureSample(Background, Sampler, textureCoord);
    let textColor = textureSample(Storage, Sampler, textureCoord);
    return mix(backgroundColor, textColor, textColor.a);
}
