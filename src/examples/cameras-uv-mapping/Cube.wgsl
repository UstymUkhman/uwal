@group(0) @binding(31) var Sampler: sampler;
@group(0) @binding(32) var Texture: texture_2d<f32>;

@fragment fn fragment(cube: MeshVertexUV) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, cube.uv);
}
