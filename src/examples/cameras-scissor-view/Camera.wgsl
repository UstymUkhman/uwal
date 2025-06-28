struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

struct FragmentOutput
{
    @location(0) target0: vec4f,
    @location(1) target1: vec4f
};

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    output.position = vec4f(GetQuadCoord(index), 0, 1);
    output.coord = (output.position.xy + 1) * 0.5;
    output.coord.y = 1 - output.coord.y;
    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> FragmentOutput
{
    var output: FragmentOutput;
    let verticalMirror = vec2f(1 - coord.x, coord.y);

    output.target1 = vec4f(verticalMirror, 0, 1);
    output.target0 = vec4f(coord, 0, 1);

    return output;
}
