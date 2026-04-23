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
    amount: vec3f,
    specular: f32
};

@group(0) @binding(40) var<uniform> AmbientLight: AmbientLightUniforms;
@group(0) @binding(41) var<uniform> DirectionalLight: DirectionalLightUniforms;
@group(0) @binding(42) var<uniform> PointLight: PointLightUniforms;
@group(0) @binding(43) var<uniform> SpotLight: SpotLightUniforms;

// Since `normal` is interpolated, we need to normalize it to a unit vector and then compute
// the light by taking the dot product of the normal to the light's reverse direction.
fn GetDirectionalLight(light: DirectionalLightUniforms, normal: vec3f) -> vec3f
{
    return light.color * dot(normalize(normal), -light.direction) * light.intensity;
}

// Compute the vector of the vertex world position to the light position.
fn GetLightDirection(lightPosition: vec3f, vertexWorldPosition: vec3f) -> vec3f
{
    return lightPosition - vertexWorldPosition;
}

// Orient vertex normals before passing them to the fragment shader.
// For 2D shapes, `vec3f(0, 0, 1)` has to be used as `vertex` value.
fn GetVertexNormal(world: mat3x3f, vertex: vec3f) -> vec3f
{
    return world * vertex;
}

fn GetAmbientLight(light: AmbientLightUniforms) -> vec3f
{
    return light.color * light.intensity;
}

fn GetLight(
    cameraDirection: vec3f,
    lightDirection: vec3f,
    vertexNormal: vec3f,
    intensity: f32,
    color: vec3f,
    amount: f32
) -> Light
{
    // Vertex normals are interpolated,
    // normalize them to a unit vector.
    let normal = normalize(vertexNormal);

    // Convert directions to unit vectors.
    let camera = normalize(cameraDirection);
    let direction = normalize(lightDirection);

    // Calculate the amount of light reflected into the camera.
    var specular = dot(normal, normalize(camera + direction));

    // Avoid negative specular values without a conditional statement.
    specular = pow(max(0, specular), intensity) * amount;

    return Light(dot(normal, direction) * color * amount, specular);
}

fn GetPointLight(
    light: PointLightUniforms,
    lightDirection: vec3f,
    cameraDirection: vec3f,
    vertexNormal: vec3f
) -> Light
{
    return GetLight(
        cameraDirection,
        lightDirection,
        vertexNormal,
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
    let direction = dot(normalize(lightDirection), -light.direction);
    let inside = smoothstep(light.limit.y, light.limit.x, direction);

    return GetLight(
        cameraDirection,
        lightDirection,
        vertexNormal,
        light.intensity,
        light.color,
        inside
    );
}
