struct VertexOutput
{
    @location(0) uv: vec2f,
    @location(1) alpha: f32,
    @builtin(position) position: vec4f
};

@group(1) @binding(0) var Sampler: sampler;
@group(1) @binding(1) var Texture: texture_2d<f32>;

fn RotateOutputUV(uv: vec2f, angle: f32) -> vec2f
{
    let c = cos(angle);
    let s = sin(angle);

    let x = uv.x - 0.5;
    let y = uv.y - 0.5;

    return vec2f(
        c * x + s * y + 0.5,
        c * y - s * x + 0.5
    );
}

@vertex fn vertex(
    @location(0) position: vec2f,
    @location(1) offset: vec2f,
    @location(2) angle: f32,
    @location(3) scale: f32,
    @location(4) alpha: f32
) -> VertexOutput
{
    var output: VertexOutput;
    let S = resolution.x / 120 /* * DPR */;

    let aspect = resolution / resolution.x;
    let clipSpace = GetVertexClipSpace(position).xy;
    output.position = vec4f(clipSpace + offset, 0, 1);

    output.uv  = (clipSpace + 1) / 2;
    output.uv += clipSpace * scale * S;
    output.uv *= aspect;
    output.uv += vec2f((1 - aspect) / 2);
    output.uv  = RotateOutputUV(output.uv, angle);

    output.alpha = alpha;
    return output;
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f
{
    let color = textureSample(Texture, Sampler, input.uv);
    return vec4f(color.rgb, color.a * input.alpha);
}
