enable dual_source_blending;

struct DSBFragmentOutput
{
    @location(0) @blend_src(0) source: vec4f,
    @location(0) @blend_src(1) factor: vec4f
};

// Specifies blending from two fragment shader outputs to a single framebuffer.
// https://registry.khronos.org/OpenGL/extensions/ARB/ARB_blend_func_extended.txt
@fragment fn dsbTextFragment(input: TextVertexOutput) -> DSBFragmentOutput
{
    var output: DSBFragmentOutput;

    let coverage = GetSubpixelCoverage(
        input.inverseTexureSize,
        input.distanceDelta,
        input.fontUV
    );

    output.source = Font.color;
    output.factor = vec4f(coverage, Font.color.a);

    return output;
}
