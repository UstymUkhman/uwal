@group(0) @binding(0) var<uniform> meshModelViewProjection: mat4x4f;

fn GetVertexClipSpace(position: vec4f) -> vec4f
{
    return meshModelViewProjection * position;
}

@vertex fn vertex(@location(0) position: vec4f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
