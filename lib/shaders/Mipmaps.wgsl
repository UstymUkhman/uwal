#include "Fullscreen.wgsl";

struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f,
    @location(1) @interpolate(flat, either) index: u32
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(1) var Texture2DArray: texture_2d_array<f32>;
@group(0) @binding(1) var TextureCube: texture_cube<f32>;

const FACES = array(
    mat3x3f( 0,  0, -2, 0, -2,  0,  1,  1,  1), // Pos X
    mat3x3f( 0,  0,  2, 0, -2,  0, -1,  1, -1), // Neg X
    mat3x3f( 2,  0,  0, 0,  0,  2, -1,  1, -1), // Pos Y
    mat3x3f( 2,  0,  0, 0,  0, -2, -1, -1,  1), // Neg Y
    mat3x3f( 2,  0,  0, 0, -2,  0, -1,  1,  1), // Pos Z
    mat3x3f(-2,  0,  0, 0, -2,  0,  1,  1, -1)  // Neg Z
);

@vertex fn vertex(
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> VertexOutput
{
    let position = GetFullTriCoord(vertexIndex);
    let coord = (position + 1.0) * 0.5;
    var output: VertexOutput;

    output.index = instanceIndex;
    output.position = vec4f(position, 0.0, 1.0);
    output.textureCoord = vec2f(coord.x, 1.0 - coord.y);

    return output;
}

@fragment fn fragment2D(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    return textureSample(Texture, Sampler, textureCoord);
}

@fragment fn fragment2DArray(
    @location(0) textureCoord: vec2f,
    @location(1) @interpolate(flat, either) index: u32
) -> @location(0) vec4f
{
    return textureSample(Texture2DArray, Sampler, textureCoord, index);
}

@fragment fn fragmentCube(
    @location(0) textureCoord: vec2f,
    @location(1) @interpolate(flat, either) index: u32
) -> @location(0) vec4f
{
    let coord = FACES[index] * vec3f(fract(textureCoord), 1);
    return textureSample(TextureCube, Sampler, coord);
}
