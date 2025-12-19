struct Uniforms
{
    color: vec4f,
    light: vec3f
};

struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex fn meshVertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    var output: VertexOutput;

    output.normal = GetVertexNormal(MeshUniforms.worldNormal, normal);
    output.position = MeshUniforms.modelViewProjection * position;

    return output;
}

@fragment fn fragment(@location(0) normal: vec3f) -> @location(0) vec4f
{
    let light = GetDirectionalLight(uniforms.light, normal);
    return vec4f(uniforms.color.rgb * light, uniforms.color.a);
}
