@group(0) @binding(0) var<uniform> resolution: vec3f;

fn GetClipSpace(position: vec2f) -> vec2f
{
    // Convert position from pixel space to clip space:
    let clipSpace = position / resolution.xy * 2 - 1;

    // Flip the Y coordinate of the clip space:
    return clipSpace * vec2f(1, -1);
}
