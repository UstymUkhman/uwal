#include "Fullscreen.wgsl";

struct VertexOutput
{
    @location(0) coord: vec4f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var Sampler: sampler;
@group(0) @binding(0) var<uniform> Matrix: mat4x4f;
@group(0) @binding(1) var CubeTexture: texture_cube<f32>;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let coord = vec4f(GetFullTriCoord(index), 1, 1);
    return VertexOutput(coord, coord);
}

@fragment fn fragment(@location(0) coord: vec4f) -> @location(0) vec4f
{
    let matrixCoord = Matrix * coord;
    var direction = matrixCoord.xyz / matrixCoord.w;
    direction = normalize(direction) * vec3f(1, 1, -1);
    return textureSample(CubeTexture, Sampler, direction);
}
