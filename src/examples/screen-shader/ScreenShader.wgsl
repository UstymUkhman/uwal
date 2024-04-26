struct Screen
{
    color: vec3f,
    time: f32
};

struct VertexOutput {
  @location(0) coords: vec2f,
  @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> screen: Screen;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let position = array(
        vec2f(-1.0, -1.0),
        vec2f( 1.0, -1.0),
        vec2f( 1.0,  1.0),

        vec2f( 1.0,  1.0),
        vec2f(-1.0,  1.0),
        vec2f(-1.0, -1.0)
    );

    var output: VertexOutput;
    let coords = position[index];

    output.position = vec4f(coords, 0, 1);
    output.coords = coords;

    return output;
}

@fragment fn fragment(@location(0) coords: vec2f) -> @location(0) vec4f
{
    return vec4f(cos(coords.xyx + screen.time) * 0.2 + screen.color + 0.4, 1);
}
