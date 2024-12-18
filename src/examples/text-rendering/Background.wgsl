struct VertexOutput
{
    @location(0) backgroundCoord: vec2f,
    @builtin(position) position: vec4f,
    @location(1) storageCoord: vec2f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Storage: texture_2d<f32>;
@group(0) @binding(2) var Background: texture_2d<f32>;
@group(0) @binding(3) var<uniform> BackgroundOffset: vec2f;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let position = GetQuadCoord(index);
    let coord = (position + 1) * 0.5;
    var output: VertexOutput;

    output.position = vec4f(position, 0, 1);
    output.storageCoord = vec2f(coord.x, 1 - coord.y);
    output.backgroundCoord = output.storageCoord + BackgroundOffset * sign(position);

    return output;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f
{
    let backgroundColor = textureSample(Background, Sampler, input.backgroundCoord);
    let textColor = textureSample(Storage, Sampler, input.storageCoord);
    return mix(backgroundColor, textColor, textColor.a);
}
