#include "Quad.wgsl";

struct char
{
    coords: vec2f,
    extent: vec2f,
    size  : vec2f,
    offset: vec2f
};

struct text
{
    scale: f32,
    color: vec4f,
    transform: mat4x4f,
    chars: array<vec3f>
};

struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var<storage> Characters: array<char>;

@group(1) @binding(0) var<storage> Text: text;

fn MapQuadCoord(index: u32) -> vec2f
{
    return (GetQuadCoord(index) + vec2f(1)) / vec2f(2);
}

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let quad = array(
        MapQuadCoord(4),
        MapQuadCoord(2),
        MapQuadCoord(0),
        MapQuadCoord(1)
    );

    var output: VertexOutput;
    let character = Characters[0];

    output.textureCoord  = quad[index];
    output.textureCoord *= character.extent;
    output.textureCoord += character.offset;

    output.position = vec4f(GetQuadCoord(index), 0, 1);

    return output;
}

fn SampleMSDFTexture(coord: vec2f) -> f32
{
    let c = textureSample(Texture, Sampler, coord);
    return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return vec4f(vec3f(SampleMSDFTexture(textureCoord)), 1);
}
