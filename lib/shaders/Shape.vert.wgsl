struct ShapeMatrixUniforms
{
    worldNormal: mat3x3f,
    modelViewProjection: mat3x3f
};

@group(0) @binding(0) var<uniform> ShapeUniforms: ShapeMatrixUniforms;

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    return vec4f((ShapeUniforms.modelViewProjection * vec3f(position, 1)).xy, 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
