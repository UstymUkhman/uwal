struct Transform
{
    matrix: mat4x4f
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var<uniform> transform: Transform;
@group(0) @binding(2) var CubeTexture: texture_cube<f32>;

@vertex fn vertex(@location(0) position: vec4f) -> VertexOutput
{
    var output: VertexOutput;

    output.position = transform.matrix * position;
    output.normal = normalize(position.xyz);

    return output;
}

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    return textureSample(CubeTexture, Sampler, normalize(normal));
}
