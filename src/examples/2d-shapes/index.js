/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL, Shaders, Shape } from "#/index";

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

    const spin = [], speed = [], shapes = [], direction = [];

    const descriptor = Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(undefined, "clear", "store", [0.2, 0.1, 0.3, 1])
    );

    const module = Renderer.CreateShaderModule(Shaders.Shape);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module, "shapeFragment"),
        vertex: Renderer.CreateVertexState(module, "shapeVertex", [
        {
            arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2")]
        }])
    });

    function clean()
    {
        spin.splice(0);
        speed.splice(0);
        shapes.splice(0);
        direction.splice(0);
        cancelAnimationFrame(raf);
    }

    function start()
    {
        createRandomShapes();
        raf = requestAnimationFrame(render);
    }

    function createRandomShapes()
    {
        for (let s = 3; s <= 12; s++)
        {
            const segments = s === 11 && 64 || s;

            for (let r = 0; r < 2; r++)
            {
                const radius = random(50, 100);
                const inner = radius * random(0.75, 0.95);

                const shape = new Shape({
                    innerRadius: inner * r,
                    renderer: Renderer,
                    segments,
                    radius
                });

                shape.Position = [
                    random(radius, canvas.width - radius),
                    random(radius, canvas.height - radius)
                ];

                shape.Rotation = random(Math.PI * 2);

                speed.push(random(1, 10));
                spin.push(random(0.1));
                shapes.push(shape);

                direction.push([
                    random(-1, 1),
                    random(-1, 1)
                ]);

                shape.Color = [
                    random(0.3, 1),
                    random(0.2, 1),
                    random(0.4, 1),
                    1
                ];
            }
        }
    }

    /**
     * @param {number} [min]
     * @param {number} [max]
     */
    function random(min, max)
    {
             if (min === undefined) { min = 0;   max = 1; }
        else if (max === undefined) { max = min; min = 0; }

        return Math.random() * (max - min) + min;
    }

    function render()
    {
        raf = requestAnimationFrame(render);
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;
        shapes.forEach(shape => Renderer.Render(shape.Update().Vertices, false));

        for (let s = 0, l = shapes.length; s < l; s++)
        {
            const shape = shapes[s], dir = direction[s];
            const { min, max } = shape.BoundingBox;
            const [x, y] = shape.Position;

            if (min[0] <= 0 || max[0] >= canvas.width)  dir[0] *= -1;
            if (min[1] <= 0 || max[1] >= canvas.height) dir[1] *= -1;

            shape.Rotation += spin[s];

            shape.Position = [
                x + dir[0] * speed[s],
                y + dir[1] * speed[s]
            ];
        }

        Renderer.Submit();
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
