override DIMENSION_SIZE = 8u;

fn CircleDistance(coord: vec2f, radius: f32) -> f32
{
    return length(coord) - radius;
}

fn SceneDistance(size: vec2f, coord: vec2f) -> f32
{
    return CircleDistance(coord - size / 2, 40.5);
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

    textureStore(texture, globalInvocation.xy, color);
}
