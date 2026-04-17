struct CameraMatrixUniforms
{
    world: mat4x4f,
    projection: mat4x4f,
    viewProjection: mat4x4f
};

@group(0) @binding(10) var<uniform> CameraMatrix: CameraMatrixUniforms;

// Convert to 2D projection matrix.
fn GetCamera2DProjection() -> mat3x3f
{
    let projection = CameraMatrix.projection;
    return mat3x3f(projection[0].xyz, projection[1].xyz, projection[2].xyz);
}

// Get position from camera's world matrix.
fn GetCameraPosition(camera: CameraMatrixUniforms) -> vec3f
{
    return camera.world[3].xyz;
}

// Get rotation from camera's world matrix.
fn GetCameraRotation(camera: CameraMatrixUniforms) -> mat3x3f
{
    let x = camera.world[0].xyz;
    let y = camera.world[1].xyz;
    let z = camera.world[2].xyz;

    let scale = vec3f(length(x), length(y), length(z));
    return mat3x3f(x / scale.x, y / scale.y, z / scale.z);
}

// Compute the vector of the vertex world position to the camera position.
fn GetCameraDirection(Camera: CameraMatrixUniforms, vertexWorldPosition: vec3f) -> vec3f
{
    return GetCameraPosition(Camera) - vertexWorldPosition;
}
