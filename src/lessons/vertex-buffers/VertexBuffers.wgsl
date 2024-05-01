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
    @location(0) position: vec2f
};

struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
};

@group(0) @binding(0) var<storage, read> constStructs: array<ConstStruct>;
@group(0) @binding(1) var<storage, read> varStructs: array<VarStruct>;

@vertex fn vertex(
    vertex: VertStruct,
    @builtin(instance_index) instance: u32
) -> VertexOutput
{
    let constStruct = constStructs[instance];
    let varStruct = varStructs[instance];

    var output: VertexOutput;

    output.position = vec4f(
        vertex.position * varStruct.scale + constStruct.offset,
        0.0, 1.0
    );

    output.color = constStruct.color;

    return output;
}

@fragment fn fragment(@location(0) color: vec4f) -> @location(0) vec4f
{
    return color;
}
