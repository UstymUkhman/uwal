/**
 * @example Geometries / Lights
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by dmnsgn's "Primitive Geometry"
 * {https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.4
 * @license MIT
 */

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    Geometries,
    PerspectiveCamera
} from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUTexture} */ let texture;
/** @type {ResizeObserver} */ let observer;
/** @type {Scene} */ const scene = new Scene();

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Geometries / Lights"));
    }
    catch (error)
    {
        alert(error);
    }

    function clean() {}

    function start() {}

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, blockSize);
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    scene.Destroy();
    Device.Destroy(
        undefined,
        texture
    );
}
