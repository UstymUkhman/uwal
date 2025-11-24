struct Uniforms
{
    color: vec4f,
    light: vec3f
};

struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> meshModelViewProjection: mat4x4f;

@vertex fn vertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    return VertexOutput(normal, meshModelViewProjection * position);
}

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    // `normal` is interpolated so it's not a unit vector.
    // Normalizing it will make it a unit vector again.
    // Compute the light by taking the dot product
    // of the normal to the light's reverse direction:
    let light = dot(normalize(normal), -uniforms.light);

    let color = uniforms.color.rgb * light;
    return vec4f(color, uniforms.color.a);
}
