struct MeshMatrixUniforms
{
    worldNormal: mat3x3f,
    modelViewProjection: mat4x4f
};

@group(0) @binding(0) var<uniform> MeshUniforms: MeshMatrixUniforms;

fn GetVertexClipSpace(position: vec4f) -> vec4f
{
    return MeshUniforms.modelViewProjection * position;
}

@vertex fn vertex(@location(0) position: vec4f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
