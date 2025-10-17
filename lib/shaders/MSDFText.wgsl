/**
 * @description This shader is adapted from WebGPU Samples "Text Rendering MSDF".
 * {@link https://webgpu.github.io/webgpu-samples/?sample=textRenderingMsdf#msdfText.wgsl}
 */

const VERTEX = array(
    vec2f(0, -1),
    vec2f(1, -1),
    vec2f(0,  0),
    vec2f(1,  0)
);

struct char
{
    coords: vec2f,
    extent: vec2f,
    size  : vec2f,
    offset: vec2f
};

struct text
{
    scale: f32,
    color: vec4f,
    transform: mat4x4f,
    chars: array<vec3f>
};

struct camera
{
    view: mat4x4f,
    projection: mat4x4f
};

struct MSDFTextVertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var<storage> Characters: array<char>;
@group(0) @binding(3) var<uniform> Camera: camera;

@group(1) @binding(0) var<storage> Text: text;

@vertex fn vertex(
    @builtin(vertex_index) index: u32,
    @builtin(instance_index) instance: u32
) -> MSDFTextVertexOutput
{
    var output: MSDFTextVertexOutput;

    let vertexPosition = VERTEX[index];
    let textElement = Text.chars[instance];

    let character = Characters[u32(textElement.z)];
    output.textureCoord = vertexPosition * vec2f(1, -1);

    let characterPosition = (vertexPosition * character.size + textElement.xy + character.offset) * Text.scale;
    output.position = Camera.projection * Camera.view * Text.transform * vec4f(characterPosition, 0, 1);

    output.textureCoord *= character.extent;
    output.textureCoord += character.coords;

    return output;
}

fn SampleMSDFTexture(coord: vec2f) -> f32
{
    let c = textureSample(Texture, Sampler, coord);
    return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}

@fragment fn fragment(@location(0) textureCoord: vec2f) -> @location(0) vec4f
{
    let signDistance = SampleMSDFTexture(textureCoord) - 0.5;
    let dimension = vec2f(textureDimensions(Texture, 0));

    let dpdx = dpdxFine(textureCoord);
    let dpdy = dpdyFine(textureCoord);

    let x = length(vec2f(dpdx.x, dpdy.x));
    let y = length(vec2f(dpdx.y, dpdy.y));

    let dx = dimension.x * x;
    let dy = dimension.y * y;

    let px = inverseSqrt(dx * dx + dy * dy) * 4;
    let pxDistance = signDistance * px;

    let alpha = smoothstep(0.5, -0.5, pxDistance);

    if (alpha < 0.001) { discard; }

    return vec4f(Text.color.rgb, Text.color.a * alpha);
}
