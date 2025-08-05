struct VertexInput
{
    @location(0) position: vec4f,
    @location(1) color: vec4f
};

struct VertexOutput
{
    @location(0) color: vec4f,
    @builtin(position) position: vec4f
};


@group(0) @binding(0) var<uniform> color: vec4f;
@group(0) @binding(1) var<uniform> projection: mat4x4f;

@vertex fn vertex(input: VertexInput) -> VertexOutput
{
    var output: VertexOutput;

    output.position = projection * input.position;
    output.color = input.color;

    return output;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f
{
    return input.color * color;
}
