struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var CubeTexture: texture_cube<f32>;

@vertex fn cubeVertex(@location(0) position: vec4f) -> VertexOutput
{
    return VertexOutput(normalize(position.xyz), GetVertexClipSpace(position));
}

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    return textureSample(CubeTexture, Sampler, normalize(normal));
}
