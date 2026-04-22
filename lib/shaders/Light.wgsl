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

struct PointLightInputs
{
    color: vec3f,
    intensity: f32,
    direction: vec3f,
    camera: vec3f,
    normal: vec3f
};

struct SpotLightInputs
{
    color: vec3f,
    intensity: f32,
    direction: vec3f,
    camera: vec3f,
    normal: vec3f,
    spot: vec3f,
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

fn GetLight(light: PointLightInputs, amount: f32) -> Light
{
    // Vertex normals are interpolated,
    // normalize them to a unit vector.
    let normal = normalize(light.normal);

    // Convert directions to unit vectors.
    let camera = normalize(light.camera);
    let direction = normalize(light.direction);

    // Calculate the amount of light reflected into the camera.
    var specular = dot(normal, normalize(camera + direction));

    // Avoid negative specular values without a conditional statement.
    specular = pow(max(0, specular), light.intensity) * amount;

    return Light(dot(normal, direction) * light.color * amount, specular);
}

fn GetAmbientLight(light: AmbientLightUniforms) -> vec3f
{
    return light.color * light.intensity;
}

fn GetPointLight(light: PointLightInputs) -> Light
{
    return GetLight(light, 1);
}

fn GetSpotLight(light: SpotLightInputs) -> Light
{
    // Lerp between light limits to avoid dividing by zero.
    let direction = dot(normalize(light.direction), -light.spot);
    let inside = smoothstep(light.limit.y, light.limit.x, direction);

    let point = PointLightInputs(
        light.color,
        light.intensity,
        light.direction,
        light.camera,
        light.normal
    );

    return GetLight(point, inside);
}
