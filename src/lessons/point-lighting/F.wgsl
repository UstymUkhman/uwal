struct Uniforms
{
    color: vec4f,
    light: vec3f,
    world: mat4x4f,
    normal: mat3x3f
};

struct VertexOutput
{
    @location(0) normal: vec3f,
    @location(1) lightVector: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;
@group(0) @binding(0) var<uniform> meshModelViewProjection: mat4x4f;

@vertex fn vertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    var output: VertexOutput;

    // Compute the world position of the vertex:
    let worldPosition = (uniforms.world * position).xyz;

    // Compute the vector of the vertex to the light position:
    output.lightVector = uniforms.light - worldPosition;

    output.position = meshModelViewProjection * position;

    // Orient the normals and pass them to the fragment shader:
    output.normal = uniforms.normal * normal;

    return output;
}

@fragment fn fragment(vertex: VertexOutput) -> @location(0) vec4f
{
    // Convert the vertex to light vector to a unit vector:
    let lightDirection = normalize(vertex.lightVector);

    // `normal` is interpolated so it's not a unit vector.
    // Normalizing it will make it a unit vector again.
    // Compute the light by taking the dot product
    // of the normal with the direction to the light:
    let light = dot(normalize(vertex.normal), lightDirection);

    let color = uniforms.color.rgb * light;
    return vec4f(color, uniforms.color.a);
}
