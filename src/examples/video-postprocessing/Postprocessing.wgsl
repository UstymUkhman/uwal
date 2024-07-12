struct Video
{
    size: vec2f,
    time: f32
};

struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var Sampler: sampler;
@group(0) @binding(1) var<uniform> video: Video;
@group(0) @binding(3) var Texture: texture_external;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    var coord = GetQuadCoord(index);

    let offset = vec2f(select(1, 0.85, resolution.y <= video.size.y));
    let position = coord * video.size * offset / resolution;
    output.position = vec4f(position, 0, 1);

    coord = (coord + 1.0) * 0.5;
    coord.y = 1.0 - coord.y;
    output.coord = coord;

    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    return vec4f(
        textureSampleBaseClampToEdge(Texture, Sampler, coord).rgb *
        (vec3f(cos(video.time), sin(video.time + 0.5236), sin(video.time + 4.1888)) + 1) / 2,
        1
    );
}
