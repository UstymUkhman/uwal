struct LightUniforms
{
    direction: vec3f,
    position: vec3f,
    intensity: f32,
    limit: vec2f
};

struct LightResult
{
    specular: f32,
    value: f32
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
fn GetDirectionalLight(light: LightUniforms, normal: vec3f) -> f32
{
    return dot(normalize(normal), -light.direction) * light.intensity;
}

// Compute the vector of the vertex world position to the light position.
fn GetLightDirection(vertexWorldPosition: vec3f, lightPosition: vec3f) -> vec3f
{
    return lightPosition - vertexWorldPosition;
}

fn GetLight(light: PointLight, amount: f32) -> LightResult
{
    // `vertexNormal` is interpolated, normalize it to a unit vector:
    let normal = normalize(light.vertexNormal);

    // Convert "vertex to light direction" to a unit vector:
    let lightDirection = normalize(light.lightDirection);

    let cameraDirection = normalize(light.cameraDirection);

    // Calculate the amount of light reflected into the camera:
    var specular = dot(normal, normalize(lightDirection + cameraDirection));

    // Avoid negative specular values without a conditional statement:
    specular = pow(max(0, specular), light.lightIntensity) * amount;

    return LightResult(specular, dot(normal, lightDirection) * amount);
}

fn GetPointLight(light: PointLight) -> LightResult
{
    return GetLight(light, 1);
}

fn GetSpotLight(light: SpotLight) -> LightResult
{
    let direction = dot(normalize(light.lightDirection), -light.spotDirection);

    // Lerp between light limits to avoid dividing by zero:
    let inside = smoothstep(light.spotLimit.y, light.spotLimit.x, direction);

    let point = PointLight(
        light.vertexNormal,
        light.lightIntensity,
        light.lightDirection,
        light.cameraDirection
    );

    return GetLight(point, inside);
}
