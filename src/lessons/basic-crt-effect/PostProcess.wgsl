struct VertexOutput
{
    @location(0) uv: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let uv = GetFullTriCoord(index);

    return VertexOutput(GetFullTexCoord(uv), vec4f(uv, 0, 1));
}

@fragment fn fragment(@location(0) uv: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, uv);
}
