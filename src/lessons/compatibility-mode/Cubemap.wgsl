struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) normal: vec3f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var CubeTexture: texture_cube<f32>;

@vertex fn cubeVertex(@location(0) position: vec4f) -> VertexOutput
{
    return VertexOutput(GetVertexClipSpace(position), normalize(position.xyz));
}

@fragment fn fragment(cube: VertexOutput) -> @location(0) vec4f
{
    return textureSample(CubeTexture, Sampler, cube.normal);
}
