struct Screen
{
    color: vec3f,
    time: f32
};

struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> screen: Screen;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    let coord = GetFullQuadCoord(index);

    output.position = vec4f(coord, 0, 1);
    output.coord = (coord + 1) * 0.5;

    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    let c = screen.color * cos(screen.time);
    let l = screen.color * length(coord.xy);
    return vec4f(screen.color + c + l, 1);
}
