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

    const spin = [], speed = [], shapes = [], direction = [];

    const descriptor = Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(undefined, "clear", "store", [0, 0, 0, 1])
    );

    const module = Renderer.CreateShaderModule([Shaders.Resolution, Shaders.Shape]);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "vertex", [
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
        let radius = random(50, 100),
            rotation = random(Math.PI * 2);

        const position = [
            random(radius, canvas.width - radius),
            random(radius, canvas.height - radius)
        ],

        color = [random(0.3, 1), random(0.2, 1), random(0.4, 1), 1];

        for (const type in SHAPE)
        {
            const shape = new Shape({
                segments: SHAPE[type],
                renderer: Renderer,
                label: type,
                radius
            });

            shape.Position = [...position];
            shape.Rotation = rotation;

            speed.push(random(1, 10));
            spin.push(random(0.1));

            shape.Color = color;
            shapes.push(shape);

            position[1] = random(radius, canvas.height - radius);
            position[0] = random(radius, canvas.width - radius);

            direction.push([random(-1, 1), random(-1, 1)]);
            rotation = random(Math.PI * 2);

            color[0] = random(0.3, 1);
            color[1] = random(0.2, 1);
            color[2] = random(0.4, 1);

            radius = random(50, 100);
        }

        const shape = new Shape({
            renderer: Renderer,
            label: "Custom",
            segments: 64,
            radius
        });

        shape.Position = position;
        shape.Rotation = rotation;

        speed.push(random(1, 10));
        spin.push(random(0.1));

        shape.Color = color;
        shapes.push(shape);

        direction.push([
            random(-1, 1),
            random(-1, 1)
        ]);
    }

    /** @param {number} [max = undefined] */
    function random(min = 0, max)
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
