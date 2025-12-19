// Orient vertex normals before passing them to the fragment shader:
fn GetVertexNormal(world: mat3x3f, vertex: vec3f) -> vec3f
{
    return world * vertex;
}

fn GetDirectionalLight(direction: vec3f, normal: vec3f) -> f32
{
    // Since `normal` is interpolated, we need to normalize it to a unit vector and then compute
    // the light by taking the dot product of the normal to the light's reverse direction:
    return dot(normalize(normal), -direction);
}
