struct Transform
{
    matrix: mat4x4f
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) textureCoord: vec2f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_external;
@group(0) @binding(2) var<uniform> transform: Transform;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    var position = GetQuadCoord(index);

    // Move quad to top-right corner:
    position = (position + 1) * 0.5;

    output.position = transform.matrix * vec4f(position, 0.0, 1.0);
    output.textureCoord = position;

    return output;
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSampleBaseClampToEdge(Texture, Sampler, textureCoord);
}
