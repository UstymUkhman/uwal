const ONE_THIRD = 1.0 / 3.0;
const RED_BRIGHTNESS = 1.2;
const BRIGHTNESS = -0.025;
const CONTRAST = 2.0;

struct VertexOutput
{
    @location(0) coord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(1) var Sampler: sampler;
@group(0) @binding(2) var<uniform> size: vec2f;
@group(0) @binding(3) var Texture: texture_external;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let max = ONE_THIRD * 2;
    var output: VertexOutput;
    var coord = GetFullQuadCoord(index);

    let scale = vec2f(min(resolution.x / size.x, max)) * size / resolution.xy;
    let position = coord * scale * resolution.z - vec2f(0, scale.y);
    output.position = vec4f(position, 0, 1);

    coord = (coord + 1.0) * 0.5;
    coord.y = 1.0 - coord.y;
    output.coord = coord;

    return output;
}

// Based on TerrifyingCookie's HLSL: https://pastebin.com/zVxsZBVG
@fragment fn fragment(@location(0) coord: vec2f) -> @location(0) vec4f
{
    // Sample input video texture:
    var color = textureSampleBaseClampToEdge(Texture, Sampler, coord).rgb;

    // Convert to linear color space:
    color = pow(color, vec3f(0.45));

    // Get the average grayscale color:
    var average = dot(color, vec3f(ONE_THIRD));

    // Calculate the weight of the red color, min and max values can be tweaked:
    let weight = smoothstep(0.1, 0.25, color.r - average);

    // Tweak the color space of the average color to apply contrast:
    // average = pow(average * 1.2 /* original value was 1.1 */, 2);

    // Alternative contrast calculation; may result in better black and whites,
    // but at cost of possible motion dithering and red color bleeding:
    average = (average - 0.5 + BRIGHTNESS) * CONTRAST + 0.5;

    // Interpolate between the average and the red color based on its weight:
    color = mix(vec3f(average), vec3f(RED_BRIGHTNESS, 0.5, 0.5) * color, weight);

    // Convert back to gamma space:
    return vec4f(pow(color, vec3f(2.2)), 1);
}
