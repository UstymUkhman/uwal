struct ConstStruct
{
    color: vec4f,
    offset: vec2f
};

struct VarStruct
{
    scale: vec2f
};

@group(0) @binding(0) var<uniform> constStruct: ConstStruct;
@group(0) @binding(1) var<uniform> varStruct: VarStruct;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    return vec4f(position[index] * varStruct.scale + constStruct.offset, 0.0, 1.0);
}

@fragment fn fragment() -> @location(0) vec4f
{
    return constStruct.color;
}
