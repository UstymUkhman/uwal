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

struct MeshVertexNormal
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f
};

@vertex fn vertexNormal(@location(0) position: vec4f, @location(1) normal: vec3f) -> MeshVertexNormal
{
    return MeshVertexNormal(GetVertexClipSpace(position), normal);
}

struct MeshVertexUV
{
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f
};

@vertex fn vertexUV(@location(0) position: vec4f, @location(1) uv: vec2f) -> MeshVertexUV
{
    return MeshVertexUV(GetVertexClipSpace(position), uv);
}

struct MeshVertexNormalUV
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f,
    @location(1) uv: vec2f
};

@vertex fn vertexNormalUV(
    @location(0) position: vec4f, @location(1) normal: vec3f, @location(2) uv: vec2f
) -> MeshVertexNormalUV
{
    return MeshVertexNormalUV(GetVertexClipSpace(position), normal, uv);
}
