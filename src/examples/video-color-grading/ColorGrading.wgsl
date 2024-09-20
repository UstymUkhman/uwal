// https://www.youtube.com/shorts/r9tQu77XoGY
const R = 7.0 / 5.0;
const B = 8.0 / 5.0;

struct Video
{
    pad: f32,
    time: f32,
    size: vec2f
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
    let color = textureSampleBaseClampToEdge(Texture, Sampler, coord);
    let gradient = vec3f(pow(color.r, R), color.g, pow(color.b, B));
    let output = mix(color.rgb, gradient, (sin(video.time) + 1) / 2);

    return vec4f(output, color.a);
}
