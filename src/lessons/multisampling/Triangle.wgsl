struct VertexOutput
{
    @builtin(position) position: vec4f,
    @location(0) @interpolate(perspective, centroid) baryCoord: vec3f
};

@vertex fn vertex(@builtin(vertex_index) index: u32) -> VertexOutput
{
    let position = array(
        vec2f( 0.0,  0.5), // Top Center
        vec2f(-0.5, -0.5), // Bottom Left
        vec2f( 0.5, -0.5)  // Bottom Right
    );

    let baryCoords = array(
        vec3f(1, 0, 0),
        vec3f(0, 1, 0),
        vec3f(0, 0, 1)
    );

    var output: VertexOutput;

    output.position = vec4f(position[index], 0.0, 1.0);
    output.baryCoord = baryCoords[index];

    return output;
}

@fragment fn fragment(
    // `centroid` sampling should probably be the default when using multisampling.
    @location(0) @interpolate(perspective, centroid) baryCoord: vec3f
) -> @location(0) vec4f
{
    return select(
        vec4f(1, 1, 0, 1),
        vec4f(1, 0, 0, 1),
        all(baryCoord >= vec3f(0)) &&
        all(baryCoord <= vec3f(1))
    );
}
