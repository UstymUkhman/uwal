struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@vertex fn meshVertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    return VertexOutput(normal, GetVertexClipSpace(position));
}

@fragment fn meshFragment(input: VertexOutput) -> @location(0) vec4f
{
    return vec4f(input.normal, 1.0);
}
