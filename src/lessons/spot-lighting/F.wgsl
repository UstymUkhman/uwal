struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) cameraDirection: vec3f,
    @location(1) lightDirection: vec3f,
    @location(2) vertexNormal: vec3f
};

@vertex fn FVertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    var output: VertexOutput;

    output.position = GetVertexClipSpace(position);

    // Compute the world position of the vertex:
    let worldPosition = GetVertexWorldPosition(position);

    // Compute the vector of the vertex to the camera position:
    output.cameraDirection = GetCameraDirection(CameraMatrix, worldPosition);

    // Compute the vector of the vertex to the light position:
    output.lightDirection = GetLightDirection(SpotLight.position, worldPosition);

    // Orient the normals and pass them to the fragment shader:
    output.vertexNormal = GetVertexNormal(MeshMatrix.worldNormal, normal);

    return output;
}

@fragment fn FFragment(vertex: VertexOutput) -> @location(0) vec4f
{
    let spotLight = GetSpotLight(
        SpotLight,
        vertex.lightDirection,
        vertex.cameraDirection,
        vertex.vertexNormal
    );

    return vec4f(color.rgb * spotLight.amount + spotLight.specular, color.a);
}
