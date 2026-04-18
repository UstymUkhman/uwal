struct VertexOutput
{
    @location(0) normal: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var<uniform> Light: LightUniforms;

@fragment fn FFragment(@location(1) normal: vec3f) -> @location(0) vec4f
{
    let light = GetDirectionalLight(Light, normal);
    return vec4f(color.rgb * light, color.a);
}
