struct Curtains
{
    mouse: vec2f,
    delta: vec2f,
    ratio: f32
};

struct Plane
{
    @builtin(position) position: vec4f,
    @location(0) origin: vec4f,
    @location(1) vertex: vec4f,
    @location(2) uvs: vec2f
};

const LAVENDER = vec3f(0.9, 0.9, 0.98);
const LAVENDER_BLUSH = vec3f(1, 0.94, 0.96);

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Text: texture_2d<f32>;
@group(0) @binding(2) var Logo: texture_2d<f32>;
@group(0) @binding(3) var<uniform> curtains: Curtains;

fn getNormal(o: vec3f, p: vec3f) -> vec3f
{
    let bitangent = vec3f(o.x, p.y + 0.25, o.z) - p;
    let tangent = vec3f(o.x + 0.25, o.y, o.z) - p;
    return normalize(cross(tangent, bitangent));
}

@vertex fn planeVertex(
    @location(0) origin: vec4f,
    @location(1) uv: vec2f
) -> Plane
{
    var vertex = origin;
    let ratio = vertex.y + 0.5;
    let delta = curtains.delta.x;

    var dampingX = curtains.mouse.x;
    let dampingY = curtains.mouse.y;
    let time = curtains.delta.y * 0.0015;

    let dist = distance(vec2f(dampingX, 0), vec2f(vertex.x, 0));
    let wave = cos((1 / (sin(dist) - 2) - time) * 35);
    dampingX = 1 - abs(dampingX - vertex.x) / 2;

    let strength = ratio * wave * delta * dampingX * dampingY * 0.005;
    vertex.x += strength * abs(ratio) * sign(vertex.x);
    vertex.z += strength * 12;

    return Plane(
        GetVertexClipSpace(vertex),
        origin, vertex, vec2f(1 - uv.x, uv.y)
    );
}

@fragment fn fragment(plane: Plane) -> @location(0) vec4f
{
    // Background:
    let time = sin(curtains.delta.y * 0.005);
    let top = mix(LAVENDER, LAVENDER_BLUSH, -time);
    let bottom = mix(LAVENDER, LAVENDER_BLUSH, time);
    let s = smoothstep(0f, 1f, plane.uvs.y);
    let background = mix(top, bottom, s);

    // Logo:
    let center = vec2f(0.5, 0.25);
    let scale = 1 / vec2f(0.5 / curtains.ratio, 0.5);
    let uv = (plane.uvs - center) * scale + center;
    let logo = textureSample(Logo, Sampler, uv);

    var color = vec4f(mix(background, logo.rgb, logo.a), 1);

    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1)
    {
        color = vec4f(background, 1);
    }

    // Text:
    let text = textureSample(Text, Sampler, plane.uvs);
    color = vec4f(mix(color.rgb, text.rgb, text.a), 1);

    // Lighting:
    let intensity = 0.35;
    let ambient = color.rgb * (1 - intensity);
    let lightPosition = normalize(vec3f(0.3, 0.3, 1));
    let normal = getNormal(plane.origin.xyz, plane.vertex.xyz);
    let light = smoothstep(0.45, 1, dot(normal, lightPosition));

    return vec4f(color.rgb * light * intensity + ambient, 1);
}
