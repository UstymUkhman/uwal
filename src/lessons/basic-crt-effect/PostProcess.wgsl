struct Effect
{
    amount: f32,
    cellSize: f32,
    multiplier: f32,
    cellBrightness: f32
};

struct VertexOutput
{
    @location(0) uv: vec2f,
    @builtin(position) position: vec4f
};

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Texture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> effect: Effect;

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let uv = GetFullTriCoord(index);
    return VertexOutput(GetFullTexCoord(uv), vec4f(uv, 0, 1));
}

@fragment fn fragment(input: VertexOutput) -> @location(0) vec4f
{
    let cellIndex = u32(input.position.x * effect.cellSize) % 3;
    var cellColor = vec3f(0); cellColor[cellIndex] = 1;
    let cell = cellColor + effect.cellBrightness;

    let banding = abs(sin(input.position.y * effect.multiplier));
    let effectAmount = mix(vec3f(1), cell * banding, effect.amount);
    let color = textureSample(Texture, Sampler, input.uv);

    return vec4f(color.rgb * effectAmount, color.a);
}
