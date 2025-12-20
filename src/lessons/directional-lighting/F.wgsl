struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var<uniform> light: vec3f;

@vertex fn meshVertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    var output: VertexOutput;

    output.normal = GetVertexNormal(MeshUniforms.worldNormal, normal);
    output.position = GetVertexClipSpace(position);

    return output;
}

@fragment fn meshFragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    let light = GetDirectionalLight(light, normal);
    return vec4f(color.rgb * light, color.a);
}
