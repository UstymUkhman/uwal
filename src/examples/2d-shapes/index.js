/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import { Device, Shaders, Color, Shape, MathUtils } from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {Shape[]} */ const shapes = [];
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "2D Shapes"));
    }
    catch (error)
    {
        alert(error);
    }

    const color = new Color(0x331a4d);
    const spin = [], speed = [], direction = [];
    const ShapePipeline = new Renderer.Pipeline();
    const module = ShapePipeline.CreateShaderModule(Shaders.Shape);

    await Renderer.AddPipeline(ShapePipeline, {
        fragment: ShapePipeline.CreateFragmentState(module, "shapeFragment"),
        vertex: ShapePipeline.CreateVertexState(module, "shapeVertex",
            ShapePipeline.CreateVertexBufferLayout("position", void 0, "shapeVertex")
        )
    });

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(color));

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
        const [width, height] = Renderer.CanvasSize;

        for (let s = 3; s <= 12; s++)
        {
            const segments = s === 11 && 64 || s;

            for (let r = 0; r < 2; r++)
            {
                const shape = new Shape();
                const radius = MathUtils.Random(50, 100);
                const inner = MathUtils.Random(0.75, 0.95) * radius;
                const shapeDescriptor = { innerRadius: inner * r, segments, radius };

                shape.SetRenderPipeline(Renderer, ShapePipeline, shapeDescriptor);
                shape.Rotation = MathUtils.Random(0, MathUtils.TAU);

                shape.Position = [
                    MathUtils.Random(radius,  width - radius),
                    MathUtils.Random(radius, height - radius)
                ];

                speed.push(MathUtils.Random(1, 10));
                spin.push(MathUtils.Random(0, 0.1));

                shape.Color = color.rgb = [
                    MathUtils.Random(0.3, 1),
                    MathUtils.Random(0.2, 1),
                    MathUtils.Random(0.4, 1)
                ];

                direction.push([
                    MathUtils.Random(-1, 1),
                    MathUtils.Random(-1, 1)
                ]);

                shapes.push(shape);
            }
        }
    }

    function render()
    {
        const [width, height] = Renderer.CanvasSize;

        for (let s = 0, l = shapes.length; s < l; s++)
        {
            const shape = shapes[s], dir = direction[s];
            const { BindGroupResources, VertexBuffer, IndexBuffer, Vertices } = shape;

            // We could have each shape use its own rendering pipeline, set it up at render time, and automatically
            // handle this data, all under the hood. However, that would be somewhat inefficient to swap between 20
            // pipelines every frame, so instead we use one rendering pipeline and update its data from each shape.
            // For fewer shapes it's ok to have dedicated pipelines, it'd make the code a bit shorter and simpler.
            ShapePipeline.SetBindGroupsFromResources(shape.BindGroupResources);
            ShapePipeline.SetVertexBuffers(shape.VertexBuffer);
            ShapePipeline.SetIndexBuffer(...shape.IndexBuffer);
            ShapePipeline.SetDrawParams(shape.Vertices);

            const { min, max } = shape.BoundingBox;
            const [x, y] = shape.Position;

            if (min[0] <= 0 || max[0] >= width)  dir[0] *= -1;
            if (min[1] <= 0 || max[1] >= height) dir[1] *= -1;

            shape.Position = [x + dir[0] * speed[s], y + dir[1] * speed[s]];
            shape.Rotation += spin[s];

            shape.Update();
            Renderer.Render(false);
        }

        Renderer.Submit();
        raf = requestAnimationFrame(render);
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
    shapes.forEach(shape => shape.Destroy());
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy();
    shapes.splice(0);
}
