/**
 * @example Screen Shader
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by OGL's Triangle Screen Shader
 * {@link https://oframe.github.io/ogl/examples/?src=triangle-screen-shader.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future releases thanks to new library APIs.
 * @version 0.0.2
 * @license MIT
 */

import UWAL from "@/UWAL";
import ScreenShader from "./ScreenShader.wgsl";

/** @type {number} */ let raf;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Screen Shader Encoder"));
    }
    catch (error)
    {
        alert(error);
    }

    const descriptor = Renderer.CreateRenderPassDescriptor(
        Renderer.CreateColorAttachment(),
        "Screen Shader Render Pass"
    );

    const module = Renderer.CreateShaderModule(ScreenShader, "Screen Shader Uniforms");
    const vertex = Renderer.CreateVertexState(module);
    const fragment = Renderer.CreateFragmentState(module);

    const pipeline = Renderer.CreateRenderPipeline({
        label: "Screen Shader Pipeline", vertex, fragment
    });

    const screenUniformBufferSize =
        Float32Array.BYTES_PER_ELEMENT +
        Float32Array.BYTES_PER_ELEMENT * 3;

    const screenUniformBuffer = Renderer.CreateBuffer({
        label: "Screen Shader Uniform Buffer",
        size: screenUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroup = Renderer.CreateBindGroup({
        label: "Screen Shader Uniform Buffer Bind Group",
        layout: pipeline.getBindGroupLayout(0),
        entries: Renderer.CreateBindGroupEntries(
            { buffer: screenUniformBuffer }
        )
    });

    const screenUniformValues = new Float32Array(
        screenUniformBufferSize / Float32Array.BYTES_PER_ELEMENT
    );

    screenUniformValues.set([0.0, 0.3515625, 0.609375]);

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        screenUniformValues.set([time * 0.001], 3);
        UWAL.SetCanvasSize(canvas.width, canvas.height);
        descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;

        Renderer.WriteBuffer(screenUniformBuffer, screenUniformValues);
        Renderer.Render(descriptor, pipeline, 6);
        raf = requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            UWAL.SetCanvasSize(inlineSize, blockSize);
        }

        Renderer.AddBindGroups(bindGroup);
        raf = requestAnimationFrame(render);
    });

    observer.observe(canvas);
}

export function destroy()
{
    cancelAnimationFrame(raf);
    UWAL.Destroy();
}
