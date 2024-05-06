struct Shape
{
    position: vec2f,
    scale: vec2f,
    color: vec4f
};

struct Vertex
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@group(0) @binding(0) var<storage, read> shape: Shape;

@vertex fn vertex(@location(0) position: vec2f) -> Vertex
{
    var output: Vertex;

    output.position = vec4f(
        shape.position + position * shape.scale,
        0.0, 1.0
    );

    output.color = shape.color;

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
