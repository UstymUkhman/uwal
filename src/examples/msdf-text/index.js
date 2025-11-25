/**
 * @example MSDF Text
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.2.1
 * @license MIT
 */

import {
    Color,
    Device,
    MSDFText,
    MathUtils,
    PerspectiveCamera
} from "#/index";

import Font from "/assets/fonts/Matrix-Code-NFI.json";
import FontImage from "/assets/fonts/Matrix-Code-NFI.png";
import FontURL from "/assets/fonts/Matrix-Code-NFI.json?url";

/** @type {MSDFText} */ const Characters = new MSDFText();
/** @type {GPUBuffer[]} */ const buffers = [];
/** @type {ResizeObserver} */ let observer;
/** @type {Renderer} */ let Renderer;
/** @type {number} */ let raf;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "MSDF Text"));
    }
    catch (error)
    {
        alert(error);
    }

    const dark = new Color(0x2e3440);
    const Camera = new PerspectiveCamera();

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(dark),
        Renderer.CreateDepthStencilAttachment()
    );

    const Pipeline = await Characters.CreateRenderPipeline(Renderer);

    // alpha & scale (4) + color (4) + transform (16) + x & y (2):
    let bufferOffset = Float32Array.BYTES_PER_ELEMENT * 6 + 2;
    const colorOffset = Float32Array.BYTES_PER_ELEMENT * 4;
    bufferOffset *= Float32Array.BYTES_PER_ELEMENT;

    canvas.removeEventListener("mouseenter", onOver);
    canvas.removeEventListener("touchstart", onOver);
    canvas.removeEventListener("mousemove", onOver);
    canvas.removeEventListener("touchmove", onOver);
    canvas.removeEventListener("mouseleave", onOut);
    canvas.removeEventListener("touchend", onOut);

    canvas.addEventListener("mouseenter", onOver);
    canvas.addEventListener("touchstart", onOver);
    canvas.addEventListener("mousemove", onOver);
    canvas.addEventListener("touchmove", onOver);
    canvas.addEventListener("mouseleave", onOut);
    canvas.addEventListener("touchend", onOut);

    await Characters.LoadFont(FontURL, true);
    let rows = 0, columns = 0, delays = [];
    const position = { x: -1.0, y: -1.0 };

    const light = new Color(0x88c0d0);
    const data = new Float32Array(5);

    function clean()
    {
        buffers.forEach(buffer => buffer.destroy());
        Pipeline.ClearRenderBundles();
        cancelAnimationFrame(raf);
        buffers.splice(0);
        delays.splice(0);
    }

    function start()
    {
        createCharGrid();
        data.set([1, ...light.rgba]);
        raf = requestAnimationFrame(render);
        Characters.UpdatePerspective(Camera);
    }

    function createCharGrid()
    {
        const [width, height] = Renderer.BaseCanvasSize;
        const ids = Font.chars.map(({ id }) => id);

        const charWidth = width / 24;
        rows = Math.ceil(height / 40);
        columns = Math.ceil(charWidth);

        dark.Set(0x5e81ac, 0x40);
        let x = charWidth / 8;

        if (height <= 880)
        {
            let add = height / 40;
            add = 23 - add | 0;
            columns += add - 1;
            x += add / 10;
            rows += add;
        }

        for (let i = 0, l = rows * columns; i < l; ++i)
        {
            const c = i % columns, r = i / columns | 0;
            delays.push(MathUtils.RandomInt(1, 240));

            buffers.push(Characters.Write(String.fromCharCode(ids[MathUtils.RandomInt(0, 90)]), dark));
            Characters.SetTransform(MathUtils.Mat4.translation([-x + c * 0.25, 4.65 - r * 0.4, -8]), buffers[i]);
        }
    }

    function onOver(event)
    {
        if (!position) return;

        position.x = (event.touches?.[0].clientX ?? event.offsetX) / canvas.offsetWidth;
        position.y = (event.touches?.[0].clientY ?? event.offsetY) / canvas.offsetHeight;

        position.x += (0.5 - position.x) * 0.05;
        position.y -= position.y * 0.06;
    }

    function onOut()
    {
        position.x = position.y = -1;
    }

    function render()
    {
        Renderer.Render();
        const { AspectRatio } = Renderer;
        raf = requestAnimationFrame(render);

        for (let d = 0, l = delays.length; d < l; ++d)
        {
            const dx = (position.x - (d % columns) / columns) * AspectRatio;
            const dy = position.y - (d / columns | 0) / rows;

            let minDelay = 120, maxDelay = 240;
            let dist = dx * dx + dy * dy;

            data.set(dark.rgba, 1);

            if (dist < 0.04)
            {
                data.set(light.rgb, 1);
                dist = (0.04 - dist) * 25;

                delays[d] -= dist * delays[d] - 1 | 0;
                minDelay  -= dist * (minDelay * 0.5) | 0;
                maxDelay  -= dist * (maxDelay * 0.5) | 0;

                dist *= 1.2; data[4] = dist ** 2 + 0.2;
            }

            if (!--delays[d])
            {
                data[0] = MathUtils.RandomInt(0, 90);
                delays[d] = MathUtils.RandomInt(minDelay, maxDelay);
                Pipeline.WriteBuffer(buffers[d], data, bufferOffset, 0, 1);
            }

            Pipeline.WriteBuffer(buffers[d], data, colorOffset, 1, 4);
        }
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            const width = (inlineSize <= 960 && inlineSize) || inlineSize - 240;
            Renderer.SetCanvasSize(width, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
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
    Characters.Destroy();
    Renderer.Destroy();
    Device.Destroy(buffers);
}
