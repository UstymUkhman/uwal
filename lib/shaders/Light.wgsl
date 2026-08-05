struct AmbientLightUniforms
{
    color: vec3f,
    intensity: f32
};

struct DirectionalLightUniforms
{
    color: vec3f,
    intensity: f32,
    direction: vec3f
};

struct PointLightUniforms
{
    color: vec3f,
    intensity: f32,
    position: vec3f
};

struct SpotLightUniforms
{
    color: vec3f,
    intensity: f32,
    position: vec3f,
    direction: vec3f,
    limit: vec2f
};

struct Light
{
    diffuse: vec3f,
    specular: vec3f
};

@group(0) @binding(40) var<uniform> AmbientLight: AmbientLightUniforms;
@group(0) @binding(41) var<uniform> DirectionalLight: DirectionalLightUniforms;
@group(0) @binding(42) var<uniform> PointLight: PointLightUniforms;
@group(0) @binding(43) var<uniform> SpotLight: SpotLightUniforms;

fn GetLightDirection(lightPosition: vec3f, vertexWorldPosition: vec3f) -> vec3f
{
    // Compute the vector of the vertex world position to the light position.
    return lightPosition - vertexWorldPosition;
}

fn GetDirectionalLight(light: DirectionalLightUniforms, normal: vec3f) -> vec3f
{
    // Since vertex normals are interpolated, normalize them to a unit vector and then compute
    // the light by taking the dot product of the normal to the light's reverse direction.
    return light.color * dot(normalize(normal), -light.direction) * light.intensity;
}

fn GetAmbientLight() -> vec3f
{
    // Assuming there's only one ambient light in the scene.
    return AmbientLight.color * AmbientLight.intensity;
}

fn GetLight(
    vertexNormal: vec3f,
    cameraDirection: vec3f,
    lightDirection: vec3f,
    intensity: f32,
    color: vec3f,
    amount: f32
) -> Light
{
    let colorAmount = color * amount;

    // Vertex normals are interpolated,
    // normalize them to a unit vector.
    let normal = normalize(vertexNormal);

    // Convert directions to unit vectors.
    let camera = normalize(cameraDirection);
    let direction = normalize(lightDirection);

    // Calculate the amount of light reflected into the camera.
    let specular = dot(normalize(camera + direction), normal);

    return Light(
        max(dot(normal, direction), 0) * colorAmount,
        pow(max(specular, 0), intensity) * colorAmount
    );
}

fn GetPointLight(
    light: PointLightUniforms,
    lightDirection: vec3f,
    cameraDirection: vec3f,
    vertexNormal: vec3f
) -> Light
{
    return GetLight(
        vertexNormal,
        cameraDirection,
        lightDirection,
        light.intensity,
        light.color,
        1
    );
}

fn GetSpotLight(
    light: SpotLightUniforms,
    lightDirection: vec3f,
    cameraDirection: vec3f,
    vertexNormal: vec3f
) -> Light
{
    // Lerp between light limits to avoid dividing by zero.
    let direction = dot(normalize(lightDirection), -SpotLight.direction);
    let inside = smoothstep(SpotLight.limit.y, SpotLight.limit.x, direction);

    return GetLight(
        vertexNormal,
        cameraDirection,
        lightDirection,
        light.intensity,
        light.color,
        inside
    );
}
