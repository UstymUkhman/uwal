struct Shape
{
    color: vec4f,
    matrix: mat3x3f
};

@group(0) @binding(1) var<uniform> shape: Shape;

@vertex fn vertex(@location(0) position: vec2f) -> @builtin(position) vec4f
{
    let matrixPosition = shape.matrix * vec3f(position, 1);
    let clipSpace = GetClipSpace(matrixPosition.xy);

    return vec4f(clipSpace, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return shape.color;
}
