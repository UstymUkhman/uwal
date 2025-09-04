/**
 * @example Screen Shader
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by OGL's "Triangle Screen Shader"
 * {@link https://oframe.github.io/ogl/examples/?src=triangle-screen-shader.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import { Device, Shaders, Color } from "#/index";
import ScreenShader from "./ScreenShader.wgsl";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUBuffer} */ let screenBuffer;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Screen Shader"));
    }
    catch (error)
    {
        alert(error);
    }

    const RenderPipeline = await Renderer.CreatePipeline([Shaders.Quad, ScreenShader]);
    const { screen, buffer } = RenderPipeline.CreateUniformBuffer("screen");

    RenderPipeline.SetBindGroupsFromResources(buffer);
    screen.color.set(new Color(0x005a9c).rgb);
    RenderPipeline.SetDrawParams(6);
    screenBuffer = buffer;

    function render(time)
    {
        // By passing `screen.time.buffer`, we're also
        // writing the `screen.color` value to the GPUBuffer:
        RenderPipeline.WriteBuffer(buffer, screen.time.buffer);

        raf = requestAnimationFrame(render);
        screen.time.set([time * 0.001]);
        Renderer.Render();
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
        }

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy(screenBuffer);
}
