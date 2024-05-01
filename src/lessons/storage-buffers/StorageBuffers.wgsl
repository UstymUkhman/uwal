struct ConstStruct
{
    color: vec4f,
    offset: vec2f
};

struct VarStruct
{
    scale: vec2f
};

struct VertStruct
{
    position: vec2f
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@group(0) @binding(0) var<storage, read> constStructs: array<ConstStruct>;
@group(0) @binding(1) var<storage, read> varStructs: array<VarStruct>;
@group(0) @binding(2) var<storage, read> vertStructs: array<VertStruct>;

@vertex fn vertex(
    @builtin(vertex_index) vertex: u32,
    @builtin(instance_index) instance: u32
) -> VertexOutput
{
    let constStruct = constStructs[instance];
    let varStruct = varStructs[instance];

    var output: VertexOutput;

    output.position = vec4f(
        vertStructs[vertex].position * varStruct.scale + constStruct.offset,
        0.0, 1.0
    );

    output.color = constStruct.color;

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
