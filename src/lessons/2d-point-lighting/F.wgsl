struct VertexOutput
{
    @location(0) normal: vec3f,
    @location(1) lightDirection: vec3f,
    @location(2) cameraDirection: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var<uniform> Light: LightUniforms;
@group(0) @binding(3) var<uniform> Camera: CameraUniforms;

@vertex fn shapeVertex(@location(0) position: vec2f) -> VertexOutput
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
    output.normal = GetVertexNormal(ShapeUniforms.worldNormal, vec3f(0, 0, 1));

    return output;
}

@fragment fn shapeFragment(vertex: VertexOutput) -> @location(0) vec4f
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
