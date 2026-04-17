#include "Camera.wgsl";

struct ShapeMatrixUniforms
{
    world: mat3x3f,
    worldNormal: mat3x3f
};

struct ShapeVertexPosition
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f
};

@group(0) @binding(20) var<uniform> ShapeMatrix: ShapeMatrixUniforms;

fn GetVertexWorldPosition(position: vec2f) -> vec3f
{
    return ShapeMatrix.world * vec3f(position, 0);
}

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    let modelViewProjection = GetCamera2DProjection() * ShapeMatrix.world;
    return vec4f((modelViewProjection * vec3f(position, 1)).xy, 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> ShapeVertexPosition
{
    return ShapeVertexPosition(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position)
    );
}

struct ShapeVertexNormal
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f
};

@vertex fn vertexNormal(
    @location(0) position: vec2f,
    @location(1) normal: vec3f
) -> ShapeVertexNormal
{
    return ShapeVertexNormal(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position),
        ShapeMatrix.worldNormal * normal
    );
}

struct ShapeVertexUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) uv: vec2f
};

@vertex fn vertexUV(
    @location(0) position: vec2f,
    @location(1) uv: vec2f
) -> ShapeVertexUV
{
    return ShapeVertexUV(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position),
        uv
    );
}

struct ShapeVertexNormalUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
};

@vertex fn vertexNormalUV(
    @location(0) position: vec2f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> ShapeVertexNormalUV
{
    return ShapeVertexNormalUV(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position),
        ShapeMatrix.worldNormal * normal,
        uv
    );
}
