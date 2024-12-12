enable dual_source_blending;

struct TextFragmentOutput
{
    @location(0) @blend_src(0) source: vec4f,
    @location(0) @blend_src(1) factor: vec4f
};

@fragment fn dsbTextFragment(
    @location(0) texture: vec2f,
    @location(1) distanceDelta: f32,
    @location(2) inverseTexureSize: vec2f
) -> TextFragmentOutput
{
    let coverage = GetSubpixelCoverage(texture, distanceDelta, inverseTexureSize);

    // Specifies blending from two fragment shader outputs to a single framebuffer.
    // https://registry.khronos.org/OpenGL/extensions/ARB/ARB_blend_func_extended.txt
    var output: TextFragmentOutput;

    output.source = vec4f(Font.color.rgb, 1);
    output.factor = vec4f(coverage, 1);

    return output;
}
