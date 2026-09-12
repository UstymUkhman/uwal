struct Effect
{
    amount: f32,
    cellSize: f32,
    multiplier: f32,
    cellBrightness: f32
};

override WORKGROUP_DIMENSION = 8u;

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var<uniform> effect: Effect;
@group(0) @binding(2) var InputTexture: texture_2d<f32>;

@compute @workgroup_size(WORKGROUP_DIMENSION, WORKGROUP_DIMENSION)
fn computation(@builtin(global_invocation_id) id: vec3u)
{
    let outputSize = textureDimensions(OutputTexture);
    if (id.x >= outputSize.x || id.y >= outputSize.y) { return; }

    let cellIndex = u32(f32(id.x) * effect.cellSize) % 3;
    var cellColor = vec3f(0); cellColor[cellIndex] = 1;
    let cell = cellColor + effect.cellBrightness;

    let banding = abs(sin(f32(id.y) * effect.multiplier));
    let effectAmount = mix(vec3f(1), cell * banding, effect.amount);

    let uv = (vec2f(id.xy) + 0.5) / vec2f(outputSize);
    let color = textureSampleLevel(InputTexture, Sampler, uv, 0);

    textureStore(OutputTexture, id.xy, vec4f(color.rgb * effectAmount, color.a));
}
