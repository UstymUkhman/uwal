@group(0) @binding(1) var Sampler: sampler;
@group(0) @binding(2) var Texture: texture_2d<f32>;

@fragment fn fragment(mesh: MeshVertexNormalUV) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, mesh.uv);
}
