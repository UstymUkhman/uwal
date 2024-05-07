struct Vertex
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) translation: vec2f,
    @location(2) scale: vec2f,
    @location(3) color: vec4f
) -> Vertex
{
    var output: Vertex;

    output.position = vec4f(
        position * scale + translation,
        0.0, 1.0
    );

    output.color = color;

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
