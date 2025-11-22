struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> meshModelViewProjection: mat4x4f;

@vertex fn vertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    return VertexOutput(normal, meshModelViewProjection * position);
}

@group(0) @binding(1) var<uniform> color: vec4f;

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    return vec4f(normalize(normal), 1.0) * color;
}
