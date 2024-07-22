@compute @workgroup_size(1) fn compute(@builtin(global_invocation_id) id: vec3u)
{
    let center = vec2f(textureDimensions(Texture)) / 2.0;

    // The distance from the center of the texture:
    let dist = distance(vec2f(id.xy), center);

    // Compute stripes based on distance
    // and write color to the texture:
    textureStore(Texture, id.xy, select(
        vec4f(1, 0, 0, 1),
        vec4f(0, 1, 1, 1),
        dist / 32.0 % 2.0 < 1.0
    ));
}
