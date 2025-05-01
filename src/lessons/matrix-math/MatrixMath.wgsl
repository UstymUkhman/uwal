struct Uniforms
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    // Multiply current vertex position by the transformation matrix:
    let clipSpace = GetClipSpace((uniforms.matrix * vec3f(position, 1)).xy);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}
