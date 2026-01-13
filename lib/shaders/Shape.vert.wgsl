struct ShapeMatrixUniforms
{
    world: mat3x3f,
    worldNormal: mat3x3f,
    viewProjection: mat3x3f
};

struct ShapeVertexPosition
{
    @builtin(position) position: vec4f,
    @location(0) worldPosition: vec3f
};

@group(0) @binding(0) var<uniform> ShapeUniforms: ShapeMatrixUniforms;

fn GetVertexWorldPosition(position: vec2f) -> vec3f
{
    return ShapeUniforms.world * vec3f(position, 0);
}

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    let modelViewProjection = ShapeUniforms.viewProjection * ShapeUniforms.world;
    return vec4f((modelViewProjection * vec3f(position, 1)).xy, 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> ShapeVertexPosition
{
    return ShapeVertexPosition(
        GetVertexClipSpace(position),
        GetVertexWorldPosition(position)
    );
}
