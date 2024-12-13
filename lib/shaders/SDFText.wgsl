/**
 * This shader is adapted from Anton Stepin's "webgl_fonts" and therefore
 * is under the same license copyright as the original source code:
 * https://github.com/astiopin/webgl_fonts
 */

override TRIPLET_FACTOR = 0.6;
const THRESHOLD = 20.0 / 256.0;
const MIN_GRAD = THRESHOLD * 0.1;

struct font
{
    color: vec4f,
    back: vec4f,
    subpx: f32,
    hint: f32
};

struct text
{
    matrix: mat3x3f,
    texureSize: vec2f
};

struct TextVertexOutput
{
    @location(0) texture: vec2f,
    @location(1) distanceDelta: f32,
    @builtin(position) position: vec4f,
    @location(2) inverseTexureSize: vec2f
};

@group(0) @binding(0) var<uniform> Text: text;
@group(0) @binding(1) var<uniform> Font: font;
@group(0) @binding(2) var Texture: texture_2d<f32>;
@group(0) @binding(3) var Sampler: sampler;

@vertex fn textVertex(
    @location(0) position: vec2f,
    @location(1) texture: vec2f,
    @location(2) size: f32
) -> TextVertexOutput
{
    var output: TextVertexOutput;
    let clipSpace = Text.matrix * vec3f(position, 1);

    output.inverseTexureSize = 1 / Text.texureSize;
    output.position = vec4f(clipSpace.xy, 0, 1);
    output.distanceDelta = 1 / size;
    output.texture = texture;

    return output;
}

fn GetSubpixelCoverage(texture: vec2f, distanceDelta: f32, inverseTexureSize: vec2f) -> vec3f
{
    // Sample the texture with L pattern:
    let sdf  = textureSample(Texture, Sampler, texture).r;
    let sdfX = textureSample(Texture, Sampler, texture + vec2f(inverseTexureSize.x, 0)).r;
    let sdfY = textureSample(Texture, Sampler, texture + vec2f(0, inverseTexureSize.y)).r;

    // Estimate stroke direction by the distance field gradient vector:
    let strokeGradient = vec2f(sdfX - sdf, sdfY - sdf);
    let strokeGradientLength = max(length(strokeGradient), MIN_GRAD);

    // Calculate stroke vertical gradient from its direction length:
    let gradient = strokeGradient / vec2f(strokeGradientLength);
    let verticalGradient = abs(gradient.y);

    // Blur vertical strokes along the X axis and add some contrast to the horizontal ones:
    let horizontalDelta = mix(distanceDelta * 1.1, distanceDelta * 0.6, verticalGradient);
    let resultDelta = mix(distanceDelta, horizontalDelta, Font.hint);

    var alpha = smoothstep(0.5 - resultDelta, resultDelta + 0.5, sdf);
    /* Additional contrast: */ alpha = pow(alpha, Font.hint * verticalGradient * 0.2 + 1);

    // Discard pixels beyond a threshold to minimise possible artifacts:
    if (alpha < THRESHOLD) { discard; }

    // Calculate subpixel coverage:
    let triplet = Font.subpx * gradient.x * 0.5;
    let z = TRIPLET_FACTOR * triplet;

    let top = abs(z);
    let max = vec3f(-z, 0, z);
    let average = vec3f(mix(top, -top - 1, alpha));

    return clamp(max - average, vec3f(0), vec3f(1));
}

@fragment fn textFragment(
    @location(0) texture: vec2f,
    @location(1) distanceDelta: f32,
    @location(2) inverseTexureSize: vec2f
) -> @location(0) vec4f
{
    let premultipliedFontColor = Font.color.rgb * vec3f(Font.color.a);
    let coverage = GetSubpixelCoverage(texture, distanceDelta, inverseTexureSize);

    // For subpixel rendering each color component is blended separately.
    return vec4f(mix(Font.back.rgb, premultipliedFontColor, coverage), 1);
}
