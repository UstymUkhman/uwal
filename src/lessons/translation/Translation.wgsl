struct Uniforms
{
    color: vec4f,
    translation: vec2f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    let clipSpace = GetClipSpace(position + uniforms.translation);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}
