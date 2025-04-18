/**
 * @module Shader Constants
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Shader Constants
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-constants.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */

import { UWAL, Color } from "#/index";
import Triangle from "./Triangle.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Shader Constants"));
    }
    catch (error)
    {
        alert(error);
    }

    const module = Renderer.CreateShaderModule(Triangle);
    const vertex = Renderer.CreateVertexState(module);

    const fragment = Renderer.CreateFragmentState(
        module, void 0, void 0, { RED: 1, '123': 0.5 }
    );

    Renderer.CreatePipeline({ vertex, fragment });

    const background = Renderer.CreateColorAttachment();
    background.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(background);

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        Renderer.Render(3);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
