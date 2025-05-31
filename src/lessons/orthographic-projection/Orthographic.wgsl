struct Uniforms
{
    color: vec4f,
    matrix: mat4x4f
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec4f) -> @builtin(position) vec4f
{
    return uniforms.matrix * position;
    // return uniforms.matrix * vec4f(position.xyz, 1);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}
