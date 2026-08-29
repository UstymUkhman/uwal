struct VertexOutput
{
    @location(0) coord: vec4f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var CubeTexture: texture_cube<f32>;
@group(0) @binding(2) var<uniform> inverseViewProjection: mat4x4f;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    let coord = GetFullTriCoord(index);

    output.position = vec4f(coord, 1, 1);
    output.coord = output.position;

    return output;
}

@fragment fn fragment(vertex: VertexOutput) -> @location(0) vec4f
{
    let coord = inverseViewProjection * vertex.coord;
    let direction = normalize(coord.xyz / coord.w) * vec3f(1, 1, -1);
    return textureSample(CubeTexture, Sampler, direction);
}
