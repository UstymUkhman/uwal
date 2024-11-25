struct Shape
{
    color: vec4f,
    matrix: mat3x3f
};

#include "Resolution.wgsl";

@group(0) @binding(1) var<uniform> shape: Shape;

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    let matrixPosition = shape.matrix * vec3f(position, 1);
    let clipSpace = GetClipSpace(matrixPosition.xy);
    return vec4f(clipSpace, 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
