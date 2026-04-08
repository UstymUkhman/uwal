struct ShapeMatrixUniforms
{
    world: mat3x3f,
    worldNormal: mat3x3f,
    viewProjection: mat3x3f
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
    let modelViewProjection = ShapeMatrix.viewProjection * world;
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
