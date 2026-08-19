struct VertexOutput
{
    @builtin(position) position: vec4f,
    @interpolate(flat, either) @location(0) colorIndex: u32
};

@vertex fn vertex(
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> VertexOutput
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    let offset = array(
        vec2f( 0.0,  0.5), // Top Middle
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    return VertexOutput(
        vec4f(position[vertexIndex] + offset[instanceIndex], 0, 1),
        instanceIndex
    );
}

@fragment fn fragment(
    @interpolate(flat,either)
    @location(0) colorIndex: u32
) -> @location(0) vec4f
{
    let colors = array(
        vec4f(1, 1, 0, 1), // Yellow
        vec4f(0, 1, 1, 1), // Cyan
        vec4f(1, 0, 1, 1)  // Magenta
    );

    return colors[colorIndex];
}
