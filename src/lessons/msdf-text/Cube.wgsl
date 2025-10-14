struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@vertex fn cubeVertex(@location(0) position: vec4f) -> VertexOutput
{
    return VertexOutput(normalize(position.xyz), GetVertexClipSpace(position));
}

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    return vec4f(normalize(normal), 1.0);
}
