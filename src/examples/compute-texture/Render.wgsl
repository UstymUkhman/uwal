@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;

struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let coord = GetFullTriCoord(index);

    return VertexOutput(GetFullTexCoord(coord), vec4f(coord, 0, 1));
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, coord);
}
