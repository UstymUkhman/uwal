import UWAL from "@/UWAL";
import TriangleUniforms from "./TriangleUniforms.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Triangle Uniforms Encoder"));
    }
    catch (error)
    {
        alert(error);
    }

    const colorAttachment = Renderer.CreateColorAttachment(
        undefined,
        "clear",
        "store",
        [0.3, 0.3, 0.3, 1]
    );

    const descriptor = Renderer.CreateRenderPassDescriptor(
        [colorAttachment],
        "Triangle Uniforms Render Pass"
    );

    const module = Renderer.CreateShaderModule(TriangleUniforms, "Triangle Shader Uniforms");
    const vertex = Renderer.CreateVertexState(module);
    const fragment = Renderer.CreateFragmentState(module);

    const pipeline = Renderer.CreateRenderPipeline({
        label: "Triangle Uniforms Pipeline", vertex, fragment
    });

    const uniformBufferSize =
        4 * Float32Array.BYTES_PER_ELEMENT + // color  - 4 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT + // scale  - 2 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT;  // offset - 2 32bit floats

    const uniformBuffer = Renderer.CreateBuffer({
        size: uniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const uniformValues = new Float32Array(uniformBufferSize / Float32Array.BYTES_PER_ELEMENT);

    const colorOffset = 0;
    const scaleOffset = 4;
    const offsetOffset = 6;

    uniformValues.set([0, 1, 0, 1], colorOffset);
    uniformValues.set([-0.5, -0.25], offsetOffset);

    const entries = Renderer.CreateBindGroupEntries({
        buffer: uniformBuffer
    });

    const bindGroup = Renderer.CreateBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        label: "Uniform Buffer Bind Group",
        entries
    });

    Renderer.AddBindGroups(bindGroup);

    function render()
    {
        UWAL.SetCanvasSize(canvas.width, canvas.height);
        uniformValues.set([0.5 / UWAL.AspectRatio, 0.5], scaleOffset);

        Renderer.WriteBuffer(uniformBuffer, uniformValues);

        descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;
        Renderer.Render(descriptor, pipeline, 3);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            UWAL.SetCanvasSize(inlineSize, blockSize);
        }

        render();
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
