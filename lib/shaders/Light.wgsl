struct LightUniforms
{
    direction: vec3f,
    position: vec3f,
    intensity: f32,
    limit: vec2f
};

struct PointLight
{
    vertexNormal: vec3f,
    lightIntensity: f32,
    lightDirection: vec3f,
    cameraDirection: vec3f
};

struct SpotLight
{
    vertexNormal: vec3f,
    lightIntensity: f32,
    lightDirection: vec3f,
    cameraDirection: vec3f,
    spotDirection: vec3f,
    spotLimit: vec2f
};

// Orient vertex normals before passing them to the fragment shader.
// For 2D shapes, `vec3f(0, 0, 1)` has to be used as `vertex` value.
fn GetVertexNormal(world: mat3x3f, vertex: vec3f) -> vec3f
{
    return world * vertex;
}

// Since `normal` is interpolated, we need to normalize it to a unit vector and then compute
// the light by taking the dot product of the normal to the light's reverse direction.
fn GetDirectionalLight(direction: vec3f, normal: vec3f) -> f32
{
    return dot(normalize(normal), -direction);
}

// Compute the vector of the vertex world position to the light position.
fn GetLightDirection(vertexWorldPosition: vec3f, lightPosition: vec3f) -> vec3f
{
    return lightPosition - vertexWorldPosition;
}

fn GetLightColor(input: PointLight, color: vec3f, amount: f32) -> vec3f
{
    // `vertexNormal` is interpolated, normalize it to a unit vector:
    let normal = normalize(input.vertexNormal);

    // Convert "vertex to light direction" to a unit vector:
    let lightDirection = normalize(input.lightDirection);

    let cameraDirection = normalize(input.cameraDirection);

    // Calculate the amount of light reflected into the camera:
    var specular = dot(normal, normalize(lightDirection + cameraDirection));

    // Avoid negative specular values without a conditional statement:
    specular = pow(max(0, specular), input.lightIntensity) * amount;

    return color * dot(normal, lightDirection) * amount + specular;
}

fn GetPointLightColor(input: PointLight, color: vec3f) -> vec3f
{
    return GetLightColor(input, color, 1);
}

fn GetSpotLightColor(input: SpotLight, color: vec3f) -> vec3f
{
    let direction = dot(normalize(input.lightDirection), -input.spotDirection);

    // Lerp between light limits to avoid dividing by zero:
    let inside = smoothstep(input.spotLimit.y, input.spotLimit.x, direction);

    let point = PointLight(
        input.vertexNormal,
        input.lightIntensity,
        input.lightDirection,
        input.cameraDirection
    );

    return GetLightColor(point, color, inside);
}
