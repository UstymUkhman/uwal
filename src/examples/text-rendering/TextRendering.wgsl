@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) texture: vec2f,
    @location(2) scale: f32
) -> @builtin(position) vec4f
{
    let clipSpace = GetClipSpace(position);
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return vec4f(1);
}
