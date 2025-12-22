struct VertexOutput
{
    @location(0) normal: vec3f,
    @location(1) lightDirection: vec3f,
    @location(2) cameraDirection: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var<uniform> Light: LightUniforms;
@group(0) @binding(3) var<uniform> Camera: CameraUniforms;

@vertex fn meshVertex(@location(0) position: vec4f, @location(1) normal: vec3f) -> VertexOutput
{
    var output: VertexOutput;

    output.position = GetVertexClipSpace(position);

    // Compute the world position of the vertex:
    let worldPosition = GetVertexWorldPosition(position);

    // Compute the vector of the vertex to the light position:
    output.lightDirection = GetLightDirection(worldPosition, Light.position);

    // Compute the vector of the vertex to the camera position:
    output.cameraDirection = GetCameraDirection(worldPosition, Camera.position);

    // Orient the normals and pass them to the fragment shader:
    output.normal = GetVertexNormal(MeshUniforms.worldNormal, normal);

    return output;
}

@fragment fn meshFragment(vertex: VertexOutput) -> @location(0) vec4f
{
    let pointLightColor = GetPointLightColor(
        PointLight(
            Light.intensity,
            vertex.normal,
            vertex.lightDirection,
            vertex.cameraDirection
        ), color.rgb
    );

    return vec4f(pointLightColor, color.a);
}
