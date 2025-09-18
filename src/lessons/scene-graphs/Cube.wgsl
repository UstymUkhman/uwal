struct VertexInput
{
    @location(0) position: vec4f,
    @location(1) color: vec4f
};

struct VertexOutput
{
    @location(0) color: vec4f,
    @builtin(position) position: vec4f
};

@vertex fn cubeVertex(input: VertexInput) -> VertexOutput
{
    return VertexOutput(input.color, GetVertexClipSpace(input.position));
}

@fragment fn cubeFragment(vertex: VertexOutput) -> @location(0) vec4f
{
    return vertex.color * color;
}
