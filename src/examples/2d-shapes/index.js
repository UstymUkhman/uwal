/**
 * @example 2D Shapes
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import * as UWAL from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;

const Camera = new UWAL.Camera2D();
const scene = new UWAL.Scene();

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "2D Shapes"));
    }
    catch (error)
    {
        alert(error);
    }

    const color = new UWAL.Color(0x331a4d);
    const ShapePipeline = new Renderer.Pipeline();
    const DummyGeometry = new UWAL.Geometries.Shape();

    const spin = [], speed = [], direction = [], uniform = [];
    const module = ShapePipeline.CreateShaderModule(UWAL.Shaders.Shape);
    const cameraBuffer = Camera.SetRenderPipeline(ShapePipeline);
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(color));

    await Renderer.AddPipeline(ShapePipeline, {
        fragment: ShapePipeline.CreateFragmentState(module),
        vertex: ShapePipeline.CreateVertexState(module, void 0,
            DummyGeometry.GetPositionBufferLayout(ShapePipeline)
        )
    });

    DummyGeometry.Destroy();

    function clean()
    {
        spin.splice(0);
        speed.splice(0);
        uniform.splice(0);
        direction.splice(0);
        scene.Children.splice(0);
        cancelAnimationFrame(raf);
    }

    function start()
    {
        createRandomShapes();
        raf = requestAnimationFrame(render);
    }

    function randomColor(uniform)
    {
        color.rgb = [UWAL.MathUtils.Random(0.3), UWAL.MathUtils.Random(0.2), UWAL.MathUtils.Random(0.4)];
        uniform.color.set(color.rgba);

        ShapePipeline.WriteBuffer(uniform.buffer, uniform.color);
        return uniform.buffer;
    }

    function createRandomShapes()
    {
        const [width, height] = Renderer.CanvasSize;

        for (let s = 3; s <= 12; s++)
        {
            const segments = s === 11 && 64 || s;

            for (let r = 0; r < 2; r++)
            {
                const radius = UWAL.MathUtils.Random(50, 100);
                const inner = UWAL.MathUtils.Random(0.75, 0.95) * radius;
                const shape = new UWAL.Shape(new UWAL.Geometries.Shape({ segments, radius, innerRadius: inner * r }));

                uniform.push(shape.CreateColorBuffer(ShapePipeline));

                shape.SetRenderPipeline(ShapePipeline,
                    [cameraBuffer, randomColor(uniform.at(-1))],
                    [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.SHAPE_COLOR]
                );

                direction.push([UWAL.MathUtils.Random(-1), UWAL.MathUtils.Random(-1)]);
                shape.Rotation = UWAL.MathUtils.Random(0, UWAL.MathUtils.TAU);

                shape.Position = [
                    UWAL.MathUtils.Random(radius,  width - radius),
                    UWAL.MathUtils.Random(radius, height - radius)
                ];

                speed.push(UWAL.MathUtils.Random(1, 10));
                spin.push(UWAL.MathUtils.Random(0, 0.1));

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

            if (Min[0] <= 0 || Max[0] >= width)  { dir[0] *= -1; randomColor(uniform[s]); }
            if (Min[1] <= 0 || Max[1] >= height) { dir[1] *= -1; randomColor(uniform[s]); }

            shape.Position = [x + dir[0] * speed[s], y + dir[1] * speed[s]];
            shape.Rotation += spin[s++];
        });
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            !scene.MainCamera && scene.AddMainCamera(Camera);
            Renderer.SetCanvasSize(width, blockSize);
            Camera.Size = Renderer.CanvasSize;
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Camera.Destroy();
    scene.Destroy();
    UWAL.Device.Destroy();
}
