import UWAL from "@/UWAL";
import Triangle from "./Triangle.vert.wgsl";
import Checkerboard from "./Checkerboard.frag.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Checkerboard Triangle Encoder"));
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
        "Checkerboard Triangle Render Pass"
    );

    const vertexModule = Renderer.CreateShaderModule(Triangle, "Triangle Shader");
    const fragmentModule = Renderer.CreateShaderModule(Checkerboard, "Checkerboard Shader");

    const vertex = Renderer.CreateVertexState(vertexModule);
    const fragment = Renderer.CreateFragmentState(fragmentModule);

    const pipeline = Renderer.CreateRenderPipeline({
        label: "Checkerboard Triangle Pipeline", vertex, fragment
    });

    function render()
    {
        UWAL.SetCanvasSize(canvas.width, canvas.height);

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