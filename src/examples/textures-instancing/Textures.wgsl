struct Shape
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(1) var<uniform> shape: Shape;
// @group(0) @binding(2) var Sampler: sampler;
// @group(0) @binding(3) var Texture: texture_2d<f32>;

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) translation: vec2f
) -> @builtin(position) vec4f
{
    let matrixPosition = shape.matrix * vec3f(position, 1);
    let clipSpace = GetClipSpace(matrixPosition.xy);

    return vec4f(clipSpace + translation, 0.0, 1.0);
}

@fragment fn fragment(@builtin(position) position: vec4f) -> @location(0) vec4f
{
    // return textureSample(Texture, Sampler, position.xy);
    return shape.color;
}
