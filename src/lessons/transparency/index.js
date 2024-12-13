/**
 * @module Transparency and Blending
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Transparency and Blending
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */

import { UWAL, Color } from "#/index";
import Checkerboard from "./Checkerboard.frag.wgsl";
import Triangle from "../inter-stage-variables/Triangle.vert.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    canvas.style.backgroundPosition = "0 0, 0 16px, 16px -16px, -16px 0px";
    canvas.style.backgroundSize     = "32px 32px";
    canvas.style.backgroundColor    = "#404040";
    canvas.style.backgroundImage    = `
        linear-gradient( 45deg,     #808080 25%, transparent 25%),
        linear-gradient(-45deg,     #808080 25%, transparent 25%),
        linear-gradient( 45deg, transparent 75%,     #808080 75%),
        linear-gradient(-45deg, transparent 75%,     #808080 75%)
    `;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(
            canvas, "Transparency", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const premultiplied = new Color();
    const clearColor = new Color(0, 0, 0, 0);
    const background = Renderer.CreateColorAttachment();
    const module = Renderer.CreateShaderModule([Triangle, Checkerboard]);

    background.clearValue = clearColor.rgba;
    Renderer.CreatePassDescriptor(background);
    Renderer.CreatePipeline({ module });

    const settings = {
        color: clearColor.rgb,
        premultiply: true,
        alpha: 0
    };

    const gui = new GUI().onChange(render);
    gui.add(settings, "premultiply");
    gui.add(settings, "alpha", 0, 1);
    gui.addColor(settings, "color");

    function render()
    {
        const { color, premultiply, alpha } = settings;

        clearColor.rgb = color;

        background.clearValue = premultiply
            ? clearColor.Premultiply(alpha, premultiplied).rgba
            : clearColor.rgba;

        Renderer.Render(3);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
