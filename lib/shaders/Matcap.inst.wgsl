#include "Camera.wgsl";

struct MeshMatrixUniforms
{
    world: mat4x4f,
    worldNormal: mat3x3f
};

@group(0) @binding(30) var<uniform> MeshMatrix: MeshMatrixUniforms;

fn GetVertexClipSpace(position: vec4f, world: mat4x4f) -> vec4f
{
    return CameraMatrix.viewProjection * world * position;
}

struct MeshVertexMatcap
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) viewNormal: vec3f,
    @location(3) @interpolate(flat, either) instance: u32
};

@vertex fn vertexNormal(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) instanceColumn0: vec4f,
    @location(3) instanceColumn1: vec4f,
    @location(4) instanceColumn2: vec4f,
    @location(5) instanceColumn3: vec4f,
    @builtin(instance_index) instance: u32
) -> MeshVertexMatcap
{
    let instanceMatrix = mat4x4f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2,
        instanceColumn3
    );

    let worldPosition = instanceMatrix * position;

    return MeshVertexMatcap(
        GetVertexClipSpace(position, instanceMatrix),
        worldPosition.xyz,
        -(CameraMatrix.view * worldPosition).xyz,
        normalize(GetCameraNormalMatrix() * MeshMatrix.worldNormal * normal),
        instance
    );
}

struct MeshVertexMatcapUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) viewPosition: vec3f,
    @location(2) viewNormal: vec3f,
    @location(3) uv: vec2f,
    @location(4) @interpolate(flat, either) instance: u32
};

@vertex fn vertexNormalUV(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) instanceColumn0: vec4f,
    @location(4) instanceColumn1: vec4f,
    @location(5) instanceColumn2: vec4f,
    @location(6) instanceColumn3: vec4f,
    @builtin(instance_index) instance: u32
) -> MeshVertexMatcapUV
{
    let instanceMatrix = mat4x4f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2,
        instanceColumn3
    );

    let worldPosition = instanceMatrix * position;

    return MeshVertexMatcapUV(
        GetVertexClipSpace(position, instanceMatrix),
        worldPosition.xyz,
        -(CameraMatrix.view * worldPosition).xyz,
        normalize(GetCameraNormalMatrix() * MeshMatrix.worldNormal * normal),
        uv,
        instance
    );
}
