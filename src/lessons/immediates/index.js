/**
 * @module Immediates
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Immediates
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-immediates.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Immediates from "./Immediates.wgsl";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Immediates"));
    }
    catch (error)
    {
        alert(error);
    }

    const RenderPipeline = await Renderer.CreatePipeline(Immediates);
    RenderPipeline.UseImmediates = true;
    RenderPipeline.SetDrawParams(3);

    RenderPipeline.AddImmediates(new Float32Array([
        1, 0, 0, 1, // color
        -0.4, -0.2  // offset
    ]));

    RenderPipeline.AddImmediates(new Float32Array([
        0, 1, 0, 1, // color
        0.4, -0.2   // offset
    ]));

    RenderPipeline.AddImmediates(new Float32Array([
        0, 0, 1, 1, // color
        0.0, 0.2    // offset
    ]));

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        Renderer.Render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
