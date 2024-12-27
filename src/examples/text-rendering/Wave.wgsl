struct VertexOutput
{
    @location(0) uv: vec2f,
    @location(1) alpha: f32,
    @builtin(position) position: vec4f
};

@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;

fn RotateOutputUV(uv: vec2f) -> vec2f
{
    let cos = shape.matrix[0].x;
    let sin = shape.matrix[0].y;

    return vec2f(
        cos * (uv.x - 0.5) + sin * (uv.y - 0.5) + 0.5,
        cos * (uv.y - 0.5) - sin * (uv.x - 0.5) + 0.5
    );
}

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) offset: vec2f,
    @location(2) scale: f32,
    @location(3) alpha: f32
) -> VertexOutput
{
    var output: VertexOutput;

    let aspect = resolution / resolution.x;
    let clipSpace = GetVertexClipSpace(position).xy;
    output.position = vec4f(clipSpace + offset, 0, 1);

    output.uv  = (clipSpace + 1) / 2;
    output.uv += clipSpace * scale * 4;
    output.uv *= aspect;
    output.uv += vec2f((1 - aspect) / 2);
    output.uv  = RotateOutputUV(output.uv);

    output.alpha = alpha;
    return output;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f
{
    let color = textureSample(Texture, Sampler, input.uv);
    let alpha = color.a * input.alpha;
    return vec4f(color.rgb * alpha, alpha);
}
