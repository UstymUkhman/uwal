/**
 * @example Screen Shader
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by OGL's "Triangle Screen Shader"
 * {@link https://oframe.github.io/ogl/examples/?src=triangle-screen-shader.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL, Shaders } from "@/index";
import ScreenShader from "./ScreenShader.wgsl";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Screen Shader"));
    }
    catch (error)
    {
        alert(error);
    }

    const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment());
    const module = Renderer.CreateShaderModule([Shaders.Quad, ScreenShader]);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module),
        fragment: Renderer.CreateFragmentState(module)
    });

    const screenUniformBufferSize =
        Float32Array.BYTES_PER_ELEMENT +
        Float32Array.BYTES_PER_ELEMENT * 3;

    const screenUniformBuffer = Renderer.CreateBuffer({
        size: screenUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroup = Renderer.CreateBindGroup(
        Renderer.CreateBindGroupEntries({ buffer: screenUniformBuffer })
    );

    Renderer.SetBindGroups(bindGroup);

    const screenUniformValues = new Float32Array(
        screenUniformBufferSize / Float32Array.BYTES_PER_ELEMENT
    );

    screenUniformValues.set([0, 0.3515625, 0.609375]);

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        raf = requestAnimationFrame(render);
        screenUniformValues.set([time * 0.001], 3);

        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;
        Renderer.WriteBuffer(screenUniformBuffer, screenUniformValues);

        Renderer.Render(6);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
    });

    observer.observe(canvas);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
