/**
 * @module Multisampling
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Multisampling
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-multisampling.html}&nbsp;
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

    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "crisp-edges";

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Multisampling"));
    }
    catch (error)
    {
        alert(error);
    }

    const multisample = Renderer.CreateMultisampleState();
    const module = Renderer.CreateShaderModule(Triangle);
    Renderer.CreatePipeline({ module, multisample });

    const background = Renderer.CreateColorAttachment();
    background.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(background);

    const Texture = new (await UWAL.Texture());
    Texture.Renderer = Renderer;

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize / 16 | 0, blockSize / 16 | 0, false);
        }

        Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();

        Renderer.Render(3);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
