/**
 * @module Miscellaneous Shader Input
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from Miscellaneous Shader Input
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-miscellaneous-input.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Input from "./Input.wgsl";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Miscellaneous Shader Input"));
    }
    catch (error)
    {
        alert(error);
    }

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new UWAL.Color(0x4c4c4c)));
    const RenderPipeline = await Renderer.CreatePipeline(Input);

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        RenderPipeline.SetDrawParams(3);
        Renderer.Render(false);
        RenderPipeline.DrawParams[3] = 1;
        Renderer.Render(false);
        RenderPipeline.DrawParams[3] = 2;
        Renderer.Render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
