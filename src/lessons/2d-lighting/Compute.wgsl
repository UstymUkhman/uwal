override DIMENSION_SIZE = 8u;

@group(0) @binding(0) var texture: texture_storage_2d<rgba16float, write>;

@compute @workgroup_size(DIMENSION_SIZE, DIMENSION_SIZE)
fn compute(@builtin(global_invocation_id) globalInvocation: vec3u)
{
    let size = vec2f(textureDimensions(texture));
    let coord = (vec2f(globalInvocation.xy) + 0.5) / size;
    textureStore(texture, globalInvocation.xy, vec4f(coord, 0, 1));
}
