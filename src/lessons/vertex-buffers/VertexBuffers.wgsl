struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) color: vec4f,
    @location(2) offset: vec2f,
    @location(3) scale: vec2f,
    @location(4) vertexColor: vec4f
) -> VertexOutput
{
    var output: VertexOutput;

    output.position = vec4f(
        position * scale + offset,
        0.0, 1.0
    );

    output.color = color * vertexColor;

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
