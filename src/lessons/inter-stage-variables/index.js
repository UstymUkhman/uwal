/**
 * @module Inter-stage Variables
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Inter-stage Variables
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-inter-stage-variables.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.2
 * @license MIT
 */

import UWAL from "@/UWAL";
import Triangle from "./Triangle.vert.wgsl";
import Checkerboard from "./Checkerboard.frag.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Checkerboard Triangle"));
    }
    catch (error)
    {
        alert(error);
    }

    const descriptor = Renderer.CreateRenderPassDescriptor(
        Renderer.CreateColorAttachment(
            undefined,
            "clear",
            "store",
            [0.3, 0.3, 0.3, 1]
        )
    );

    const vertexModule = Renderer.CreateShaderModule(Triangle);
    const fragmentModule = Renderer.CreateShaderModule(Checkerboard);

    const pipeline = Renderer.CreateRenderPipeline({
        vertex: Renderer.CreateVertexState(vertexModule),
        fragment: Renderer.CreateFragmentState(fragmentModule)
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
