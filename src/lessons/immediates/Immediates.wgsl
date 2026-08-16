struct Immediates
{
    color: vec4f,
    offset: vec2f
};

var<immediate> immediates: Immediates;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    return vec4f(position[index] + immediates.offset, 0, 1);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return immediates.color;
}
