#include "Camera.wgsl";

struct MeshMatrixUniforms
{
    world: mat4x4f,
    worldNormal: mat3x3f
};

@group(0) @binding(30) var<uniform> MeshMatrix: MeshMatrixUniforms;

fn GetVertexClipSpace(position: vec4f) -> vec4f
{
    return CameraMatrix.viewProjection * MeshMatrix.world * position;
}

struct MeshVertexMatcap
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) viewNormal: vec3f
};

@vertex fn vertexNormal(
    @location(0) position: vec4f,
    @location(1) normal: vec3f
) -> MeshVertexMatcap
{
    let worldPosition = MeshMatrix.world * position;

    return MeshVertexMatcap(
        GetVertexClipSpace(position),
        worldPosition.xyz,
        -(CameraMatrix.view * worldPosition).xyz,
        normalize(GetCameraNormalMatrix() * MeshMatrix.worldNormal * normal)
    );
}

struct MeshVertexMatcapUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) worldNormal: vec3f,
    @location(3) uv: vec2f
};

@vertex fn vertexNormalUV(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> MeshVertexMatcapUV
{
    let worldPosition = MeshMatrix.world * position;

    return MeshVertexMatcapUV(
        GetVertexClipSpace(position),
        worldPosition.xyz,
        -(CameraMatrix.view * worldPosition).xyz,
        MeshMatrix.worldNormal * normal,
        uv
    );
}
