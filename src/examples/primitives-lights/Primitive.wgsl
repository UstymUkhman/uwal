struct Mesh
{
    @builtin(position) position: vec4f,
    @location(0) cameraDirection: vec3f,
    @location(1) pointDirection: vec3f,
    @location(2) spotDirection: vec3f,
    @location(3) worldPosition: vec3f,
    @location(4) normal: vec3f,
    @location(5) uv: vec2f
};

@group(0) @binding(0) var<uniform> mode: f32;
@group(0) @binding(1) var Sampler: sampler;
@group(0) @binding(2) var Texture: texture_2d<f32>;

@vertex fn baseVertex(
    @location(0) position: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f
) -> Mesh
{
    let worldPosition = GetVertexWorldPosition(position);

    return Mesh(
        GetVertexClipSpace(position),
        GetCameraDirection(worldPosition),
        GetLightDirection(PointLight.position, worldPosition),
        GetLightDirection(SpotLight.position, worldPosition),
        worldPosition,
        GetVertexNormal(normal),
        uv
    );
}

@fragment fn baseFragment(mesh: Mesh) -> @location(0) vec4f
{
    var normal = mesh.normal;
    var rgb = color.rgb;

    // Texture:
    if (mode == 0)
    {
        rgb = textureSample(Texture, Sampler, mesh.uv).rgb;
    }

    // Normal:
    if (mode == 1)
    {
        rgb = vec3f(mesh.normal * 0.5 + 0.5);
    }

    // Flat Shaded:
    if (mode == 2)
    {
        normal = GetFlatFaceNormal(mesh.worldPosition);
        rgb = normal; // Use it instead of a solid color.
    }

    // UV:
    if (mode == 3)
    {
        rgb = vec3f(mesh.uv, 0);
    }

    let pointLight = GetPointLight(PointLight, mesh.pointDirection, mesh.cameraDirection, normal);
    let spotLight = GetSpotLight(SpotLight, mesh.spotDirection, mesh.cameraDirection, normal);
    let directionalLight = GetDirectionalLight(DirectionalLight, normal);

    var diffuse = GetAmbientLight();
    let specular = pointLight.specular + spotLight.specular;

    diffuse += directionalLight + pointLight.diffuse + spotLight.diffuse;
    return vec4f(rgb * diffuse + specular, 1);
}
