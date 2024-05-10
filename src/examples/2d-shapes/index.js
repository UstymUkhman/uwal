/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL, Shape, SHAPE, Shaders } from "@/index";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "2D Shapes"));
    }
    catch (error)
    {
        alert(error);
    }

    /** @type {Shape[]} */
    const shapes = [];

    const descriptor = Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(undefined, "clear", "store", [0, 0, 0, 1])
    );

    const module = Renderer.CreateShaderModule([Shaders.Resolution, Shaders.Shape]);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "vertex", [
        {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2")]
        }])
    });

    function clean()
    {
        cancelAnimationFrame(raf);
    }

    function start()
    {
        createRandomShapes();
        raf = requestAnimationFrame(render);
    }

    function createRandomShapes()
    {
        {
            const shape = new Shape({
                segments: SHAPE.SEGMENTS.TRIANGLE,
                renderer: Renderer,
                label: "Trangle",
                radius: 100
            });

            shape.Color = [random(0.3, 1), random(0.2, 1), random(0.4, 1), 1];
            shape.Position = [100, 100];
            shapes.push(shape);
        }

        {
            const shape = new Shape({
                segments: SHAPE.SEGMENTS.PENTAGON,
                renderer: Renderer,
                label: "Pentagon",
                radius: 150
            });

            shape.Color = [random(0.3, 1), random(0.2, 1), random(0.4, 1), 1];
            shape.Position = [300, 300];
            shapes.push(shape);
        }

        {
            const shape = new Shape({
                renderer: Renderer,
                label: "Custom",
                segments: 64,
                radius: 150
            });

            shape.Color = [random(0.3, 1), random(0.2, 1), random(0.4, 1), 1];
            shape.Position = [500, 500];
            shapes.push(shape);
        }
    }

    function random(min = 0, max = 1)
    {
        if (max === undefined)
        {
            max = min;
            min = 0;
        }

        return Math.random() * (max - min) + min;
    }

    function render()
    {
        // shapes[0].Rotation += 0.01;
        // raf = requestAnimationFrame(render);
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;
        shapes.forEach(shape => Renderer.Render(shape.Update().Vertices, false));

        Renderer.Submit();
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        clean(), start();
    });

    observer.observe(canvas);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
