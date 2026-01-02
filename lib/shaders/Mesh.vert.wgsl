struct MeshMatrixUniforms
{
    world: mat4x4f,
    worldNormal: mat3x3f,
    viewProjection: mat4x4f
};

@group(0) @binding(0) var<uniform> MeshUniforms: MeshMatrixUniforms;

fn GetVertexWorldPosition(position: vec4f) -> vec3f
{
    return (MeshUniforms.world * position).xyz;
}

fn GetVertexClipSpace(position: vec4f) -> vec4f
{
    let modelViewProjection = MeshUniforms.viewProjection * MeshUniforms.world;
    return modelViewProjection * position;
}

@vertex fn vertex(@location(0) position: vec4f) -> @builtin(position) vec4f
{
    return GetVertexClipSpace(position);
}
