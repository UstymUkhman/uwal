#include "Camera.wgsl";

struct ShapeMatrixUniforms
{
    world: mat3x3f,
    worldNormal: mat3x3f
};

struct ShapeVertexPosition
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) @interpolate(flat) instance: u32
};

@group(0) @binding(20) var<uniform> ShapeMatrix: ShapeMatrixUniforms;

fn GetVertexWorldPosition(position: vec2f, world: mat3x3f) -> vec3f
{
    return vec3f(position, 0) * world;
}

fn GetVertexClipSpace(position: vec2f, world: mat3x3f) -> vec4f
{
    // `ShapeMatrix` may not be used, but the `Shape` class will always
    // set it, so this is a workaround to avoid the validation error.
    var modelViewProjection = ShapeMatrix.world;
    modelViewProjection = GetCamera2DProjection() * world;
    return vec4f((modelViewProjection * vec3f(position, 1)).xy, 0, 1);
}

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) instanceColumn0: vec3f,
    @location(2) instanceColumn1: vec3f,
    @location(3) instanceColumn2: vec3f,
    @builtin(instance_index) instance: u32
) -> ShapeVertexPosition
{
    let instanceMatrix = mat3x3f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2
    );

    return ShapeVertexPosition(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        instance
    );
}

struct ShapeVertexNormal
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) @interpolate(flat) instance: u32
};

@vertex fn vertexNormal(
    @location(0) position: vec2f,
    @location(1) normal: vec3f,
    @location(2) instanceColumn0: vec3f,
    @location(3) instanceColumn1: vec3f,
    @location(4) instanceColumn2: vec3f,
    @builtin(instance_index) instance: u32
) -> ShapeVertexNormal
{
    let instanceMatrix = mat3x3f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2
    );

    return ShapeVertexNormal(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        ShapeMatrix.worldNormal * normal,
        instance
    );
}

struct ShapeVertexUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) uv: vec2f,
    @location(2) @interpolate(flat) instance: u32
};

@vertex fn vertexUV(
    @location(0) position: vec2f,
    @location(1) uv: vec2f,
    @location(2) instanceColumn0: vec3f,
    @location(3) instanceColumn1: vec3f,
    @location(4) instanceColumn2: vec3f,
    @builtin(instance_index) instance: u32
) -> ShapeVertexUV
{
    let instanceMatrix = mat3x3f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2
    );

    return ShapeVertexUV(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        uv,
        instance
    );
}

struct ShapeVertexNormalUV
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) @interpolate(flat) instance: u32
};

@vertex fn vertexNormalUV(
    @location(0) position: vec2f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) instanceColumn0: vec3f,
    @location(4) instanceColumn1: vec3f,
    @location(5) instanceColumn2: vec3f,
    @builtin(instance_index) instance: u32
) -> ShapeVertexNormalUV
{
    let instanceMatrix = mat3x3f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2
    );

    return ShapeVertexNormalUV(
        GetVertexClipSpace(position, instanceMatrix),
        GetVertexWorldPosition(position, instanceMatrix),
        ShapeMatrix.worldNormal * normal,
        uv,
        instance
    );
}
