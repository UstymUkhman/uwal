struct VertexOutput
{
    @location(0) cell: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> grid: vec2f;
@group(0) @binding(1) var<storage> state: array<u32>;

@vertex fn vertex(
    @location(0) position: vec2f,
    @builtin(instance_index) instance: u32
) -> VertexOutput
{
    let fInstance = f32(instance);
    let state = f32(state[instance]);
    let cell = vec2f(fInstance % grid.x, floor(fInstance / grid.x));

    var output: VertexOutput;

    output.position = vec4f(
        (position * state + 1) / grid - 1 +
        cell / grid * 2,
        0, 1
    );

    output.cell = cell;
    return output;
}

@fragment fn fragment(@location(0) cell: vec2f) -> @location(0) vec4f
{
    let rg = cell / grid;
    return vec4f(rg, 1 - rg.g, 1);
}
