struct CameraUniforms
{
    position: vec3f
};

// Compute the vector of the vertex world position to the camera position.
fn GetCameraDirection(vertexWorldPosition: vec3f, cameraPosition: vec3f) -> vec3f
{
    return cameraPosition - vertexWorldPosition;
}
