struct MeshMatrixUniforms
{
    world: mat4x4f,
    worldNormal: mat3x3f,
    viewProjection: mat4x4f
};

@group(0) @binding(30) var<uniform> MeshMatrix: MeshMatrixUniforms;

fn GetVertexWorldPosition(position: vec4f) -> vec3f
{
    return (MeshMatrix.world * position).xyz;
}

fn GetVertexClipSpace(position: vec4f) -> vec4f
{
    let modelViewProjection = MeshMatrix.viewProjection * MeshMatrix.world;
    return modelViewProjection * position;
}

struct MeshVertexPosition
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f
};

@vertex fn vertex(@location(0) position: vec4f) -> MeshVertexPosition
{
    return MeshVertexPosition(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position)
    );
}

struct MeshVertexNormal
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f
};

@vertex fn vertexNormal(
    @location(0) position: vec4f,
    @location(1) normal: vec3f
) -> MeshVertexNormal
{
    return MeshVertexNormal(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position),
        MeshMatrix.worldNormal * normal
    );
}

struct MeshVertexUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) uv: vec2f
};

@vertex fn vertexUV(
    @location(0) position: vec4f,
    @location(1) uv: vec2f
) -> MeshVertexUV
{
    return MeshVertexUV(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position),
        uv
    );
}

struct MeshVertexNormalUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
};

@vertex fn vertexNormalUV(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> MeshVertexNormalUV
{
    return MeshVertexNormalUV(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position),
        MeshMatrix.worldNormal * normal,
        uv
    );
}
