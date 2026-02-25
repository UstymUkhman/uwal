struct CameraUniforms
{
    position: vec3f
};

// Get position from camera's world matrix.
fn GetCameraPosition(matrix: mat4x4f) -> vec3f
{
    return matrix[3].xyz;
}

// Get rotation from camera's world matrix.
fn GetCameraRotation(matrix: mat4x4f) -> mat3x3f
{
    let x = matrix[0].xyz;
    let y = matrix[1].xyz;
    let z = matrix[2].xyz;

    let scale = vec3f(length(x), length(y), length(z));
    return mat3x3f(x / scale.x, y / scale.y, z / scale.z);
}

// Compute the vector of the vertex world position to the camera position.
fn GetCameraDirection(vertexWorldPosition: vec3f, cameraPosition: vec3f) -> vec3f
{
    return cameraPosition - vertexWorldPosition;
}
