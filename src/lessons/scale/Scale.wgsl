struct Uniforms
{
    color: vec4f,
    translation: vec2f,
    rotation: vec2f,
    scale: vec2f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    // Scale the position:
    let scaledPosition = position * uniforms.scale;

    // Rotate the position:
    let rotatedPosition = vec2f(
        scaledPosition.x * uniforms.rotation.x - scaledPosition.y * uniforms.rotation.y,
        scaledPosition.x * uniforms.rotation.y + scaledPosition.y * uniforms.rotation.x
    );

    // Add translation to the current vertex position:
    let clipSpace = GetClipSpace(rotatedPosition + uniforms.translation);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}
