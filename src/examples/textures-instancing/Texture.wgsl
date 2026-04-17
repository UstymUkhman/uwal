@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> resolution: vec3f;
@group(0) @binding(3) var<storage, read> visible: array<u32>;

@fragment fn fragment(
    @builtin(position) position: vec4f,
    @location(1) @interpolate(flat) instance: u32
) -> @location(0) vec4f
{
    if (visible[instance] == 0) { discard; }

    let x = resolution.x;
    let y = resolution.y;

    // Get screen coordinates:
    var xy = position.xy / vec2f(y);

    // Calculate horizontal offset:
    let o = (y - x) / y / -2;

    // Center horizontally & flip Y:
    xy = (xy - vec2f(o, 1)) * vec2f(1, -1);

    // Add canvas padding:
    xy = xy * 1.5 - 0.25;

    return textureSample(Texture, Sampler, xy);
}
