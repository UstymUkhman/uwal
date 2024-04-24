struct VertexOutput
{
    @builtin(position) position: vec4f
};

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    var output: VertexOutput;

    output.position = vec4f(position[index], 0.0, 1.0);
    return output;
}
