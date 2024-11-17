const ONE_THIRD = 1.0 / 3.0;

struct Text
{
    transform: mat3x3f,
    texureSize: vec2f,
    borderSize: f32
};

struct TextVertexOutput
{
    @location(0) texture: vec2f
    @location(1) subpixelOffset: f32,
    @builtin(position) position: vec4f,
    @location(2) distanceFieldDelta: f32,
    @location(3) inverseTexureSize: vec2f
};

@group(0) @binding(0) var<uniform> text: Text;

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) texture: vec2f,
    @location(2) scale: f32
) -> TextVertexOutput
{
    var output: TextVertexOutput;
    let sdfSize = text.borderSize * scale * 2;
    let clipSpace = text.transform * vec3f(position, 1);

    output.inverseTexureSize = 1 / text.texureSize;
    output.position = vec4f(clipSpace.xy, 0, 1);
    output.subpixelOffset = ONE_THIRD / scale;
    output.distanceFieldDelta = 1 / sdfSize;
    output.texture = texture;

    return output;
}

@fragment fn fragment(text: TextVertexOutput) -> @location(0) vec4f
{
    return vec4f(1);
}
