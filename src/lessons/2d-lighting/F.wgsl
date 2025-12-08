struct Uniforms
{
    color: vec4f,
    light: vec3f,
    normal: mat3x3f
};

struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> shapeModelViewProjection: mat3x3f;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

fn GetVertexClipSpace(position: vec2f) -> vec4f
{
    return vec4f((shapeModelViewProjection * vec3f(position, 1)).xy, 0, 1);
}

@vertex fn vertex(@location(0) position: vec2f) -> VertexOutput
{
    return VertexOutput(uniforms.normal * vec3f(0, 0, 1), GetVertexClipSpace(position));
}

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    // `normal` is interpolated so it's not a unit vector.
    // Normalizing it will make it a unit vector again.
    // Compute the light by taking the dot product
    // of the normal to the light's reverse direction:
    let light = dot(normalize(normal), -uniforms.light);

    return vec4f(uniforms.color.rgb * light, uniforms.color.a);
}
