/**
 * @module Blend Settings
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Transparency and Blending
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html#blend-settings}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */

import { UWAL } from "@/index";

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
            canvas, "Blend Settings", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    /**
     * @param {number} h
     * @param {number} s
     * @param {number} l
     */
    const hsl = (h, s, l) => `hsl(${h * 360 | 0}, ${s * 100}%, ${l * 100 | 0}%)`;

    /**
     * @param {number} h
     * @param {number} s
     * @param {number} l
     * @param {number} a
     */
    const hsla = (h, s, l, a) => `hsla${hsl(h, s, l).slice(3, -1)}, ${a})`;

    /** @param {number} size */
    function createDestinationImage(size)
    {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, size, size);

        for (let i = 0; i <= 6; ++i)
          gradient.addColorStop(i / 6, hsl(i / -6, 1, 0.5));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "rgba(0, 0, 0, 255)";
        ctx.globalCompositeOperation = "destination-out";
        ctx.rotate(Math.PI / -4);

        for (let i = 0; i < size * 2; i += 32)
          ctx.fillRect(-size, i, size * 2, 16);

        return canvas;
    }

    /** @param {number} size */
    function createSourceImage(size)
    {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.translate(size / 2, size / 2);

        ctx.globalCompositeOperation = "screen";
        const PI2 = Math.PI * 2, numCircles = 3;

        for (let i = 0; i < numCircles; ++i)
        {
            ctx.rotate(PI2 / numCircles);
            ctx.save();
            ctx.translate(size / 6, 0);
            ctx.beginPath();

            const radius = size / 3;
            const h = i / numCircles;
            ctx.arc(0, 0, radius, 0, PI2);

            const gradient = ctx.createRadialGradient(0, 0, radius / 2, 0, 0, radius);
            gradient.addColorStop(0.5, hsla(h, 1, 0.5, 1));
            gradient.addColorStop(1, hsla(h, 1, 0.5, 0));

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        }

        return canvas;
    }

    const size = 300;
    const source = createSourceImage(size);
    const destination = createDestinationImage(size);

    source.style.top = "8px";
    source.style.left = "8px";
    source.style.width = `${size}px`;
    source.style.height = `${size}px`;
    source.style.position = "absolute";

    destination.style.position = "absolute";
    destination.style.height = `${size}px`;
    destination.style.width = `${size}px`;
    destination.style.left = "8px";
    destination.style.top = "8px";

    document.body.appendChild(source);
    document.body.appendChild(destination);

    const background = Renderer.CreateColorAttachment();
    const module = Renderer.CreateShaderModule();

    Renderer.CreatePassDescriptor(background);
    Renderer.CreatePipeline({ module });

    function render()
    {
        Renderer.Render(0);
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

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
