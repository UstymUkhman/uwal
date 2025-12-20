struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var<uniform> light: vec3f;

@vertex fn shapeVertex(@location(0) position: vec2f) -> VertexOutput
{
    var output: VertexOutput;

    output.normal = GetVertexNormal(ShapeUniforms.worldNormal, vec3f(0, 0, 1));
    output.position = GetVertexClipSpace(position);

    return output;
}

@fragment fn shapeFragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    let light = GetDirectionalLight(light, normal);
    return vec4f(color.rgb * light, color.a);
}
