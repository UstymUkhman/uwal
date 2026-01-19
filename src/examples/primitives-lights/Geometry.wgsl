struct Mesh
{
    @builtin(position) position: vec4f,
    @location(0) cameraDirection: vec3f,
    @location(1) lightDirection: vec3f,
    @location(2) worldPosition: vec3f,
    @location(3) vertexNormal: vec3f,
    @location(4) normal: vec3f,
    @location(5) uv: vec2f
};

@group(0) @binding(2) var<uniform> mode: f32;
@group(0) @binding(3) var Sampler: sampler;
@group(0) @binding(4) var Texture: texture_2d<f32>;

@group(1) @binding(0) var<uniform> uCamera: CameraUniforms;
// @group(1) @binding(1) var<uniform> uSpotLight: LightUniforms;
@group(1) @binding(1) var<uniform> uPointLight: LightUniforms;
@group(1) @binding(2) var<uniform> uDirectionalLight: LightUniforms;

@vertex fn baseVertex(
    @location(0) position: vec4f, @location(1) normal: vec3f, @location(2) uv: vec2f
) -> Mesh
{
    let worldPosition = GetVertexWorldPosition(position);

    return Mesh(
        GetVertexClipSpace(position),
        GetCameraDirection(worldPosition, uCamera.position),
        GetLightDirection(worldPosition, uPointLight.position),
        worldPosition,
        GetVertexNormal(MeshUniforms.worldNormal, normal),
        normal,
        uv
    );
}

@fragment fn baseFragment(mesh: Mesh) -> @location(0) vec4f
{
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
        let fdx = vec3f(dpdx(mesh.worldPosition.x), dpdx(mesh.worldPosition.y), dpdx(mesh.worldPosition.z));
        let fdy = vec3f(dpdy(mesh.worldPosition.x), dpdy(mesh.worldPosition.y), dpdy(mesh.worldPosition.z));
        rgb = normalize(cross(fdx, fdy)) * 0.5 + 0.5;
    }

    // UV:
    if (mode == 3)
    {
        rgb = vec3f(mesh.uv, 0);
    }

    var light = GetDirectionalLight(uDirectionalLight, mesh.normal);

    let pointLight = GetPointLight(
        PointLight(
            mesh.normal,
            uPointLight.intensity,
            mesh.lightDirection,
            mesh.cameraDirection
        )
    );

    /* let spotLight = GetSpotLight(
        SpotLight(
            mesh.normal,
            uSpotLight.intensity,
            mesh.lightDirection,
            mesh.cameraDirection,
            uSpotLight.direction,
            uSpotLight.limit
        )
    ); */

    let specular = pointLight.specular /* + spotLight.specular */;
    light += pointLight.value /* + spotLight.value */;

    return vec4f(rgb * light + specular, 1);
}
