@group(0) @binding(0) var<uniform> projection: mat4x4f;

fn GetVertexClipSpace(position: vec4f) -> vec4f
{
    return projection * position;
}

@vertex fn vertex(@location(0) position: vec4f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
