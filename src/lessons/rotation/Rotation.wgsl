struct Uniforms
{
    color: vec4f,
    translation: vec2f,
    rotation: vec2f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    // Rotate the position:
    let rotatedPosition = vec2f(
        position.x * uniforms.rotation.x - position.y * uniforms.rotation.y,
        position.x * uniforms.rotation.y + position.y * uniforms.rotation.x
    );

    // Add translation to the current vertex position:
    let clipSpace = GetClipSpace(rotatedPosition + uniforms.translation);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}
