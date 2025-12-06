/**
 * @module 2D Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is developed using the version listed below. Please note
 * that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import { Device, Scene, Camera2D } from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "2D Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new Scene();
    const Camera = new Camera2D();

    function render()
    {
        Renderer.Render(scene);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.Size = Renderer.CanvasSize;
            scene.AddCamera(Camera);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
