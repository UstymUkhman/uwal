struct Immediates
{
    model: u32,
    material: u32
};

var<immediate> immediates: Immediates;

@group(0) @binding(0) var<storage, read> models: array<mat4x4f>;
@group(0) @binding(1) var<storage, read> materials: array<vec4f>;

@vertex fn immediatesVertex(@location(0) position: vec4f) -> @builtin(position) vec4f
{
    // `ShapeMatrix` is not used, but the `Shape` class will always
    // set it, so this is a workaround to avoid the validation error.
    let _shape_world = ShapeMatrix.world;

    return CameraMatrix.viewProjection * models[immediates.model] * position;
}

@fragment fn fragment() -> @location(0) vec4f
{
    return materials[immediates.material];
}
