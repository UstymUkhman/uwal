struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> resolution: vec3f;
@group(0) @binding(1) var Sampler: sampler;
@group(0) @binding(2) var Perspective: texture_2d<f32>;
@group(0) @binding(3) var Orthographic: texture_2d<f32>;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    var output: VertexOutput;
    output.position = vec4f(GetQuadCoord(index), 0, 1);
    output.coord = (output.position.xy + 1) * 0.5;
    return output;
}

@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    let vertical0 = textureSample(Perspective, Sampler, coord * vec2f(2, 1));
    let vertical1 = textureSample(Orthographic, Sampler, (coord - vec2f(0.5, 0)) * vec2f(2, 1));
    let vertical = mix(vertical0, vertical1, coord.x);

    let horizontal0 = textureSample(Perspective, Sampler, (coord - vec2f(0, 0.5)) * vec2f(1, 2));
    let horizontal1 = textureSample(Orthographic, Sampler, coord * vec2f(1, 2));
    let horizontal = select(horizontal0, horizontal1, coord.y < 0.5);

    return select(vertical, horizontal, resolution.x < resolution.y);
}
