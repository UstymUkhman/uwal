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
        Renderer.CreateColorAttachment()
    );

    const module = Renderer.CreateShaderModule(Shaders.Shape);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "vertex", [
        {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2")]
        },
        {
            arrayStride: (2 + 2 + 4) * Float32Array.BYTES_PER_ELEMENT,
            stepMode: 'instance',
            attributes: [
                Renderer.CreateVertexBufferAttribute("float32x2", 1),
                Renderer.CreateVertexBufferAttribute("float32x2", 2, 8),
                Renderer.CreateVertexBufferAttribute("float32x4", 3, 16)
            ]
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
        for (let s = 0; s < 1; s++)
        {
            const scale = random(0.2, 0.5);
            const ratio = UWAL.AspectRatio;

            const shape = new Shape(Renderer, SHAPE.SEGMENTS.TRIANGLE);

            shape.Position = [random(-0.9, 0.9), random(-0.9, 0.9)];
            shape.Color = [random(), random(), random(), 1];
            shape.Scale = [scale / ratio, scale];

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
        // raf = requestAnimationFrame(render);
        descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;
        shapes.forEach(shape => Renderer.Render(shape.Update().Vertices, false));

        Renderer.Submit();
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            UWAL.SetCanvasSize(inlineSize, blockSize);
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
