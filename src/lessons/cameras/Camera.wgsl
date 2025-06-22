struct VertexOutput
{
    @location(0) color: vec4f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> projection: mat4x4f;

@vertex fn vertex(
    @location(1) position: vec4f,
    @location(0) color: vec4f
) -> VertexOutput
{
    var output: VertexOutput;

    output.position = projection * position;
    output.color = color;
    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
