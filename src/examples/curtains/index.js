/**
 * @example Curtains
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by curtainsjs'
 * home page {@link https://www.curtainsjs.com/}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.4.0
 * @license MIT
 */

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    BINDINGS,
    MathUtils,
    Geometries,
    PerspectiveCamera
} from "#/index";

import Curtains from "./Curtains.wgsl";
import Logo from "/assets/images/logo.png";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;
/** @type {GPUBuffer} */ let curtainsBuffer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Curtains"));
    }
    catch (error)
    {
        alert(error);
    }

    const Pipeline = new Renderer.Pipeline();
    const Camera = new PerspectiveCamera(35);
    const Geometry = new Geometries.Mesh();

    let maxDelta = 4, delta = 0, time = 0;
    const scene = new Scene("Curtains");
    const Plane = new Mesh(Geometry);

    const module = Pipeline.CreateShaderModule([Shaders.MeshVertex, Curtains]);
    const { curtains, buffer } = Pipeline.CreateUniformBuffer("curtains");
    Geometry.Primitive = Geometries.Primitives.plane({ nx: 50, ny: 37 });

    const Texture = new (await Device.Texture(Renderer));
    const logo = await Texture.CopyImageToTexture(
        await Texture.CreateImageBitmap(Logo),
        { mipmaps: false }
    );

    Plane.SetRenderPipeline(await Renderer.AddPipeline(Pipeline,
        {
            primitive: Pipeline.CreatePrimitiveState(),
            fragment: Pipeline.CreateFragmentState(module),
            multisample: Pipeline.CreateMultisampleState(),
            depthStencil: Pipeline.CreateDepthStencilState(),
            vertex: Pipeline.CreateVertexState(module, "planeVertex", [
                Geometry.GetPositionBufferLayout(Pipeline),
                Geometry.GetUVBufferLayout(Pipeline, "planeVertex")
            ])
        }), [
            Camera.SetRenderPipeline(Pipeline),
            Texture.CreateSampler({ filter: "linear" }),
            logo.createView(),
            buffer
        ],
        [BINDINGS.CAMERA_MATRIX, 0]
    );

    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("touchmove", onMove);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove);

    const mousePosition = MathUtils.Vec2.create();
    const lastPosition = MathUtils.Vec2.create();
    const [x, y] = Plane.Scaling = [1.5, 0.9, 1];

    curtains.planeRatio.set([x / y]);
    scene.AddMainCamera(Camera);
    curtainsBuffer = buffer;
    scene.Add(Plane);

    function onMove()
    {
        MathUtils.Vec2.copy(mousePosition, lastPosition);

        let x = event.touches?.[0].clientX ?? event.offsetX;
        let y = event.touches?.[0].clientY ?? event.offsetY;

        mousePosition[0] = MathUtils.Lerp(mousePosition[0], x, 0.3);
        mousePosition[1] = MathUtils.Lerp(mousePosition[1], y, 0.3);

        x = mousePosition[0] / canvas.offsetWidth * 2 - 1;
        y = mousePosition[1] / canvas.offsetHeight * -2 + 1;

        curtains.mouse.set([x, y]);

        x = mousePosition[0] - lastPosition[0];
        y = mousePosition[1] - lastPosition[1];

        const delta = Math.min(Math.hypot(x, y) / 10, 4);
        if (maxDelta <= delta) maxDelta = delta;
    }

    function render()
    {
        delta += (maxDelta - delta) * 0.02;
        maxDelta += maxDelta * -0.01;

        curtains.deltaTime.set([delta, time++]);
        Pipeline.WriteBuffer(buffer, curtains.deltaTime.buffer);

        raf = requestAnimationFrame(render);
        Renderer.Render(scene);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, blockSize);
            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.Position = [0, 0, 1.5];
            Camera.UpdateWorldMatrix(true);
        }

        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(render);
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy(curtainsBuffer);
}
