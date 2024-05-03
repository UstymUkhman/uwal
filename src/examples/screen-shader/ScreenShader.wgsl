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
    let coord = GetQuadCoord(index);

    output.position = vec4f(coord, 0, 1);
    output.coord = coord;

    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    return vec4f(cos(coord.xyx + screen.time) * 0.2 + screen.color + 0.4, 1);
}
