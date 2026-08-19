struct ShapeVertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) vertexColor: vec3f
};

@group(0) @binding(0) var<storage, read> color: array<vec4u>;
@group(0) @binding(1) var<uniform> colors: vec2f;

@vertex fn vertexShape(
    @location(0) position: vec2f,
    @location(1) instanceColumn0: vec3f,
    @location(2) instanceColumn1: vec3f,
    @location(3) instanceColumn2: vec3f,
    @builtin(instance_index) instance: u32,
    @builtin(vertex_index) index: u32
) -> ShapeVertexOutput
{
    let instanceMatrix = mat3x3f(
        instanceColumn0,
        instanceColumn1,
        instanceColumn2
    );

    let outer = colors.r; let inner = colors.g;
    let vertexColor = select(outer, inner, index % 2 == 1);

    return ShapeVertexOutput(
        GetVertexClipSpace(position, instanceMatrix),
        vec4f(color[instance]).rgb / 255 * vertexColor
    );
}

@fragment fn fragment(@location(0) vertexColor: vec3f) -> @location(0) vec4f
{
    return vec4f(vertexColor, 1);
}
