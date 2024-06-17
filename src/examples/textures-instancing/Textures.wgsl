struct VertexOutput
{
    @location(0) textureCoord: vec2f,
    @builtin(position) position: vec4f,
    @location(1) @interpolate(flat) instance: u32,
};

@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;
@group(1) @binding(2) var<storage, read> visible: array<u32>;

@vertex fn mainVertex(
    @location(0) position: vec2f,
    @location(1) translation: vec2f,
    @builtin(instance_index) instance: u32
) -> VertexOutput
{
    var output: VertexOutput;
    let aspect = resolution / resolution.y;
    let clipSpace = GetVertexClipSpace(position).xy;

    output.position = vec4f(clipSpace + translation, 0, 1);
    output.textureCoord = clipSpace * aspect * 2.5 + 0.5;
    output.instance = instance;

    return output;
}

@fragment fn fragment(
    @location(0) textureCoord: vec2f,
    @location(1) @interpolate(flat) instance: u32
) -> @location(0) vec4f
{
    if (visible[instance] == 0) { discard; }
    // return textureSample(Texture, Sampler, textureCoord);
    let color = textureSample(Texture, Sampler, textureCoord);

    if (color.a == 0) { discard; }
    return color;
}
