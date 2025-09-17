#include "Resolution.wgsl";

@group(0) @binding(1) var<uniform> projection: mat3x3f;

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    let coords = projection * vec3f(position, 1);
    return vec4f(GetClipSpace(coords.xy), 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
