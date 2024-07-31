override RED: f32;             // Must be specified in the pipeline.
@id(123) override GREEN = 0.0; // Has to be specified as '123'.
override BLUE = 1.0;           // Can be omitted.

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    return vec4f(position[index], 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(RED, GREEN, BLUE, 1.0);
}
