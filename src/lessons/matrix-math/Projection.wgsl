struct Uniforms
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

fn GetClipSpace(position: vec2f) -> vec2f
{
    let resolution = vec2f(1024, 957);

    // Convert position from pixel space to clip space:
    let clipSpace = position / resolution.xy * 2 - 1;

    // Flip the Y coordinate of the clip space:
    return clipSpace * vec2f(1, -1);
}

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    let clipSpace = GetClipSpace((uniforms.matrix * vec3f(position, 1)).xy);
    // let clipSpace = (uniforms.matrix * vec3f(position, 1)).xy;
    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return uniforms.color;
}
