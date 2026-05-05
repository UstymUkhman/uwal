struct Curtains
{
    mouse: vec2f,
    deltaTime: vec2f,
    planeRatio: f32
};

struct Plane
{
    @builtin(position) position: vec4f,
    @location(0) originalPosition: vec4f,
    @location(1) vertexPosition: vec4f,
    @location(2) textureCoords: vec2f
};

const LAVENDER = vec3f(0.9, 0.9, 0.98);
const LAVENDER_BLUSH = vec3f(1, 0.94, 0.96);

@group(0) @binding(0) var Sampler: sampler;
@group(0) @binding(1) var Logo: texture_2d<f32>;
@group(0) @binding(2) var<uniform> curtains: Curtains;

fn getNormal(o: vec3f, p: vec3f) -> vec3f
{
    let bitangent = vec3f(o.x, p.y + 0.25, o.z) - p;
    let tangent = vec3f(o.x + 0.25, o.y, o.z) - p;
    return normalize(cross(tangent, bitangent));
}

@vertex fn planeVertex(
    @location(0) position: vec4f,
    @location(1) uv: vec2f
) -> Plane
{
    var vertex = position;
    let ratio = vertex.y - 0.5;
    let time = curtains.deltaTime.y;
    let delta = curtains.deltaTime.x;

    var attenuation = vec2f(
        (2 - abs(curtains.mouse.x - vertex.x)) / 2,
        curtains.mouse.y / -2 + 0.5
    );

    if (curtains.mouse.y <= -1)
    {
        attenuation.y += (curtains.mouse.y + 1) * 1.5;
    }

    attenuation.y = clamp(attenuation.y, 0, 1);

    let dist = distance(vec2f(curtains.mouse.x, 0), vec2f(vertex.x, 0));
    let wave = cos((1 / (cos(dist) - 2) - time * 0.0015) * 35);
    let strength = ratio * wave * delta * attenuation.x * attenuation.y;

    vertex.x += strength * abs(ratio) * sign(vertex.x) / 160;
    vertex.z += strength / 30;

    return Plane(GetVertexClipSpace(vertex), position, vertex, uv);
}

@fragment fn fragment(plane: Plane) -> @location(0) vec4f
{
    let time = sin(curtains.deltaTime.y * 0.005);
    let top = mix(LAVENDER, LAVENDER_BLUSH, time);
    let bottom = mix(LAVENDER, LAVENDER_BLUSH, -time);

    let coords = plane.textureCoords;
    let center = vec2f(0.5);
    let scale = 1 / vec2f(0.5 / curtains.planeRatio, 0.5);
    let uv = (coords - center) * scale + center;

    let s = smoothstep(0f, 1f, coords.y);
    let background = mix(top, bottom, s);
    let logo = textureSample(Logo, Sampler, uv);
    var color = vec4f(mix(background, logo.rgb, logo.a), 1);

    if (uv.x < 0 || uv.x > 1 || uv.y < 0 || uv.y > 1)
    {
        color.rgb = background;
    }

    let intensity = 0.35;
    let ambient = color.rgb * (1 - intensity);

    let normal = getNormal(plane.originalPosition.xyz, plane.vertexPosition.xyz);
    let light = smoothstep(0.45, 1, dot(normal, normalize(vec3f(0.3, 0.3, 1))));

    return vec4f(color.rgb * light * intensity + ambient, 1);
}
