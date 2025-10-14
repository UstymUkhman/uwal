@group(0) @binding(0) var<uniform> shapeModelViewProjection: mat3x3f;

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    return vec4f((shapeModelViewProjection * vec3f(position, 1)).xy, 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
