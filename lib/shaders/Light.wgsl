struct LightUniforms
{
    direction: vec3f
};

// Orient vertex normals before passing them to the fragment shader.
// For 2D shapes, `vec3f(0, 0, 1)` has to be used as `vertex` value.
fn GetVertexNormal(world: mat3x3f, vertex: vec3f) -> vec3f
{
    return world * vertex;
}

// Since `normal` is interpolated, we need to normalize it to a unit vector and then compute
// the light by taking the dot product of the normal to the light's reverse direction.
fn GetDirectionalLight(direction: vec3f, normal: vec3f) -> f32
{
    return dot(normalize(normal), -direction);
}
