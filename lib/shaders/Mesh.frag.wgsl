@group(0) @binding(31) var<uniform> color: vec4f;

@fragment fn fragment() -> @location(0) vec4f
{
    return color;
}
