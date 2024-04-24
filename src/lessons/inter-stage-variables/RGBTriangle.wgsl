struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    var color = array<vec4f, 3>(
        vec4f(1, 0, 0, 1), // Red
        vec4f(0, 1, 0, 1), // Green
        vec4f(0, 0, 1, 1)  // Blue
    );

    var output: VertexOutput;

    output.position = vec4f(position[index], 0.0, 1.0);
    output.color = color[index];

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
