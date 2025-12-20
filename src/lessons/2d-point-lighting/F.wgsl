struct Uniforms
{
    light: vec3f,
    camera: vec3f,
    intensity: f32
};

struct VertexOutput
{
    @location(0) normal: vec3f,
    @location(1) lightVector: vec3f,
    @location(2) cameraVector: vec3f,
    @builtin(position) position: vec4f
};

@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@vertex fn shapeVertex(@location(0) position: vec2f) -> VertexOutput
{
    var output: VertexOutput;

    // Compute the world position of the vertex:
    let worldPosition = GetVertexWorldPosition(position);

    // Compute the vector of the vertex to the light position:
    output.lightVector = uniforms.light - worldPosition;

    // Compute the vector of the vertex to the camera position:
    output.cameraVector = uniforms.camera - worldPosition;

    // Orient the normals and pass them to the fragment shader:
    output.normal = GetVertexNormal(ShapeUniforms.worldNormal, vec3f(0, 0, 1));

    output.position = GetVertexClipSpace(position);

    return output;
}

@fragment fn shapeFragment(vertex: VertexOutput) -> @location(0) vec4f
{
    // Convert the vertex to light vector to a unit vector:
    let lightDirection = normalize(vertex.lightVector);

    // `vertex.normal` is interpolated so it's not a unit vector.
    // Normalizing it will make it a unit vector again:
    let normal = normalize(vertex.normal);

    // Compute the light by taking the dot product
    // of the normal with the direction to the light:
    let light = dot(normal, lightDirection);

    let cameraDirection = normalize(vertex.cameraVector);

    // Calculate the amount of light reflected into the camera:
    var specular = dot(normal, normalize(lightDirection + cameraDirection));

    // Avoid negative specular values without a conditional statement:
    specular = pow(max(0, specular), uniforms.intensity);

    return vec4f(color.rgb * light + specular, color.a);
}
