struct Uniforms
{
    time: f32,
    mouse: vec2f
};

const PI = radians(180);

override DIMENSION_SIZE = 8u;

fn FillMask(distance: f32) -> f32
{
    return clamp(-distance, 0, 1);
}

fn Outline(distance: f32, width: f32) -> f32
{
    return clamp(distance + width, 0, 1) - clamp(distance, 0, 1);
}

fn CircleDistance(coord: vec2f, radius: f32) -> f32
{
    return length(coord) - radius;
}

fn SceneDistance(size: vec2f, coord: vec2f) -> f32
{
    let radius = min(size.x, size.y) / 16;
    return CircleDistance(coord - size / 2, radius);
}

fn Luminance(color: ptr<function, vec4f>, amount: f32)
{
    let luminance = amount / dot((*color).rgb, vec3f(0.2126, 0.7152, 0.0722));
    *color = *color * luminance;
}

fn Shadow(size: vec2f, coord: vec2f, position: vec2f, radius: f32) -> f32
{
    let lightDistance = length(coord - position);
    let direction = normalize(position - coord);
    var visibleLight = lightDistance * radius;

    var distance = 0.01;

    for (var i = 0; i < 64; i++)
    {
        let sceneDistance = SceneDistance(size, coord + direction * distance);

        // Ray is guaranteed to be full shadow:
        if (sceneDistance < -radius) { return 0; }

        visibleLight = min(visibleLight, sceneDistance / distance);

        distance += max(1, abs(sceneDistance));

        if (distance > lightDistance) { break; }
    }

    visibleLight = (visibleLight * lightDistance + radius) / (radius * 2);
    visibleLight = clamp(visibleLight, 0, 1);
    visibleLight = smoothstep(0, 1, visibleLight);

    return visibleLight;
}

fn AmbientOcclusion(size: vec2f, coord: vec2f, radius: f32, intensity: f32) -> f32
{
    let quarterRadius = radius / 4;
    var distance = SceneDistance(size, coord);

    distance += SceneDistance(size, coord + vec2f(0,  quarterRadius));
    distance += SceneDistance(size, coord + vec2f(0, -quarterRadius));
    distance += SceneDistance(size, coord + vec2f( quarterRadius, 0));
    distance += SceneDistance(size, coord + vec2f(-quarterRadius, 0));

    return 1 - (pow(abs(clamp(distance / radius / 5, 0, 1) - 1), 5) + 1) * intensity + (1 - intensity);
}

fn Light(size: vec2f, coord: vec2f, position: vec2f, color: vec4f, range: f32, radius: f32) -> vec4f
{
    let distance = coord - position;
    let lightDistance = length(distance);

    if (lightDistance > range) { return vec4f(0); }

    let shadow = Shadow(size, coord, position, radius);
    let falloff = (range - lightDistance) / range;

    let source = FillMask(CircleDistance(distance, radius));
    return (shadow * falloff * falloff + source) * color;
}

@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(DIMENSION_SIZE, DIMENSION_SIZE)
fn compute(@builtin(global_invocation_id) globalInvocation: vec3u)
{
    let size = vec2f(textureDimensions(texture));
    let coord = vec2f(globalInvocation.xy) + 0.5;

    // Gradient:
    var color = vec4f(vec3f(0.5), 1) * (1 - length(size / 2 - coord) / size.x);

    // Grid:
    color *= clamp(min(coord.y % 10, coord.x % 10), 0.9, 1);

    // Ambient Occlusion:
    color *= AmbientOcclusion(size, coord, 40, 0.4);

    var userLightColor = vec4f(0.75, 1, 0.5, 1);
    Luminance(&userLightColor, 0.4);

    let lightOffset = size.y / 5;

    let firstLightPosition = vec2f(size.x * (sin(uniforms.time) + 1.2) / 2.4, size.y - lightOffset);
    var firstLightColor = vec4f(0.5, 0.75, 1, 1);
    Luminance(&firstLightColor, 0.6);

    let secondLightPosition = vec2f(size.x * (sin(uniforms.time + PI) + 1.2) / 2.4, lightOffset);
    var secondLightColor = vec4f(1, 0.75, 0.5, 1);
    Luminance(&secondLightColor, 0.5);

    // Lights:
    color += Light(size, coord,      uniforms.mouse,   userLightColor, 150,  8);
    color += Light(size, coord,  firstLightPosition,  firstLightColor, 300, 15);
    color += Light(size, coord, secondLightPosition, secondLightColor, 200, 12);

    let distance = SceneDistance(size, coord);

    // Shape Fill:
    color = mix(color, vec4f(1, 0.4, 0, 1), FillMask(distance));

    // Shape Outline:
    color = mix(color, vec4f(vec3f(0.1), 1), Outline(distance, 2));

    textureStore(texture, globalInvocation.xy, color);
}
