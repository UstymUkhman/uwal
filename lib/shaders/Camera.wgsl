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
fn GetCameraPosition() -> vec3f
{
    return CameraMatrix.world[3].xyz;
}

// Get rotation from camera's world matrix.
fn GetCameraRotation() -> mat3x3f
{
    let x = CameraMatrix.world[0].xyz;
    let y = CameraMatrix.world[1].xyz;
    let z = CameraMatrix.world[2].xyz;

    let scale = vec3f(length(x), length(y), length(z));
    return mat3x3f(x / scale.x, y / scale.y, z / scale.z);
}

// Compute the vector of the vertex world position to the camera position.
fn GetCameraDirection(worldPosition: vec3f) -> vec3f
{
    return GetCameraPosition() - worldPosition;
}
