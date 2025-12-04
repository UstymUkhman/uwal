/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import {
    Color,
    Scene,
    Shape,
    Device,
    Shaders,
    Camera2D,
    MathUtils,
    Materials,
    Geometries
} from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;
/** @type {Scene} */ const scene = new Scene();

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

    const Camera = new Camera2D();
    const color = new Color(0x331a4d);

    const spin = [], speed = [], direction = [];
    const DummyGeometry = new Geometries.Shape();
    const ShapePipeline = new Renderer.Pipeline();

    const module = ShapePipeline.CreateShaderModule(Shaders.Shape);
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(color));

    await Renderer.AddPipeline(ShapePipeline, {
        fragment: ShapePipeline.CreateFragmentState(module),
        vertex: ShapePipeline.CreateVertexState(module,
            DummyGeometry.GetPositionBufferLayout(ShapePipeline)
        )
    });

    DummyGeometry.Destroy();

    function clean()
    {
        scene.Traverse(node =>
            node.Destroy?.()
        );

        spin.splice(0);
        speed.splice(0);
        direction.splice(0);
        scene.Children.splice(0);
        cancelAnimationFrame(raf);
    }

    function start()
    {
        createRandomShapes();
        raf = requestAnimationFrame(render);
    }

    function randomColor()
    {
        return color.rgb = [MathUtils.Random(0.3), MathUtils.Random(0.2), MathUtils.Random(0.4)];
    }

    function createRandomShapes()
    {
        const [width, height] = Renderer.CanvasSize;

        for (let s = 3; s <= 12; s++)
        {
            const segments = s === 11 && 64 || s;

            for (let r = 0; r < 2; r++)
            {
                const radius = MathUtils.Random(50, 100);
                const inner = MathUtils.Random(0.75, 0.95) * radius;

                const geometry = new Geometries.Shape({ segments, radius, innerRadius: inner * r });
                const shape = new Shape(geometry, new Materials.Color(randomColor()));

                direction.push([MathUtils.Random(-1), MathUtils.Random(-1)]);
                shape.Rotation = MathUtils.Random(0, MathUtils.TAU);

                shape.Position = [
                    MathUtils.Random(radius,  width - radius),
                    MathUtils.Random(radius, height - radius)
                ];

                shape.SetRenderPipeline(ShapePipeline);

                speed.push(MathUtils.Random(1, 10));
                spin.push(MathUtils.Random(0, 0.1));

                scene.Add(shape);
            }
        }
    }

    function render(_, s = 0)
    {
        const [width, height] = Renderer.CanvasSize;
        raf = requestAnimationFrame(render);
        Renderer.Render(scene);

        scene.Traverse(shape =>
        {
            const { Min, Max } = shape.BoundingBox, [x, y] = shape.Position, dir = direction[s];

            if (Min[0] <= 0 || Max[0] >= width)  { dir[0] *= -1; shape.Material.Color = randomColor(); }
            if (Min[1] <= 0 || Max[1] >= height) { dir[1] *= -1; shape.Material.Color = randomColor(); }

            shape.Position = [x + dir[0] * speed[s], y + dir[1] * speed[s]];
            shape.Rotation += spin[s++];
        });
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            !scene.MainCamera && scene.AddCamera(Camera);
            Renderer.SetCanvasSize(width, blockSize);
            Camera.Size = Renderer.CanvasSize;
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
    Device.Destroy();
    scene.Destroy();
}
