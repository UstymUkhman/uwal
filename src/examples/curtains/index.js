/**
 * @example Curtains
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by curtainsjs'
 * home page {@link https://www.curtainsjs.com/}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import * as UWAL from "#/index";
import Curtains from "./Curtains.wgsl";
import Logo from "/assets/images/logo.png";
import FontImage from "/assets/fonts/Roboto-Regular.png";
import FontURL from "/assets/fonts/Roboto-Regular.json?url";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUBuffer} */ let textBuffer;
/** @type {GPUTexture} */ let textTexture;
/** @type {ResizeObserver} */ let observer;
/** @type {GPUBuffer} */ let curtainsBuffer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    await UWAL.Device.SetRequiredFeatures("bgra8unorm-storage");

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Curtains"));
    }
    catch (error)
    {
        alert(error);
    }

    const Camera = new UWAL.PerspectiveCamera(35);
    const Geometry = new UWAL.Geometries.Mesh();

    const Pipeline = new Renderer.Pipeline();
    let maxDelta = 4, delta = 0, time = 0;

    const scene = new UWAL.Scene("Curtains");
    const Plane = new UWAL.Mesh(Geometry);
    const Text = new UWAL.MSDFText();

    const module = Pipeline.CreateShaderModule([UWAL.Shaders.MeshVertex, Curtains]);
    const { curtains, buffer } = Pipeline.CreateUniformBuffer("curtains");
    Geometry.Primitive = UWAL.Geometries.Primitives.plane({ nx: 50, ny: 37 });

    const TextPipeline = await Text.CreateRenderPipeline(Renderer, {
        multisample: Pipeline.CreateMultisampleState()
    });

    const cameraBuffer = Camera.SetRenderPipeline(Pipeline);
    const Texture = new (await UWAL.TextureUtils(Renderer));

    const mousePosition = UWAL.MathUtils.Vec2.create();
    const lastPosition = UWAL.MathUtils.Vec2.create();

    const logo = await Texture.CopyImageToTexture(
        await Texture.CreateImageBitmap(Logo),
        { mipmaps: false }
    );

    canvas.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("touchmove", onMove);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove);

    await Text.LoadFont(FontURL);
    scene.AddMainCamera(Camera);
    curtainsBuffer = buffer;
    scene.Add(Plane);

    function onMove()
    {
        UWAL.MathUtils.Vec2.copy(mousePosition, lastPosition);

        let x = event.touches?.[0].clientX ?? event.offsetX;
        let y = event.touches?.[0].clientY ?? event.offsetY;

        mousePosition[0] = UWAL.MathUtils.Lerp(mousePosition[0], x, 0.3);
        mousePosition[1] = UWAL.MathUtils.Lerp(mousePosition[1], y, 0.3);

        x = mousePosition[0] / canvas.offsetWidth * 2 - 1;
        y = mousePosition[1] / canvas.offsetHeight * -2 + 1;

        curtains.mouse.set([x, y]);

        x = mousePosition[0] - lastPosition[0];
        y = mousePosition[1] - lastPosition[1];

        const delta = Math.min(Math.hypot(x, y), 4);
        if (maxDelta <= delta) maxDelta = delta;
    }

    function clear()
    {
        Text.Clear(textBuffer);
        textTexture?.destroy();
        cancelAnimationFrame(raf);
    }

    async function start()
    {
        const [width] = Renderer.BaseCanvasSize;
        const size = (width - 360) / 1268;
        const scaleX = size * 1.14;
        const textY = size * 1.25;
        const textZ = size * 4.6;

        TextPipeline.TextureView = textTexture = Texture.CreateStorageTexture({
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        TextPipeline.DestroyPassEncoder = !!(Text.CameraMatrixBuffer = cameraBuffer);
        const [x, y] = Plane.Scaling = [scaleX + 0.36, 0.9, 1];
        TextPipeline.UseTextureView = true;
        curtains.planeRatio.set([x / y]);

        Text.SetTranslation(
            UWAL.MathUtils.Mat4.translation([0, textY - 2, textZ - 9]),
            textBuffer = Text.Write("Unopinionated WebGPU Abstraction Library", 0, 0.0025, true)
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
                cameraBuffer,
                Texture.CreateSampler({ filter: "linear" }),
                TextPipeline.TextureView,
                logo, buffer
            ],
            [UWAL.BINDINGS.CAMERA_MATRIX, 0]
        );

        raf = requestAnimationFrame(render);
    }

    function render()
    {
        delta += (maxDelta - delta) * 0.02;
        maxDelta += maxDelta * -0.01;

        curtains.deltaTime.set([delta, time++]);
        Pipeline.WriteBuffer(buffer, curtains.deltaTime.buffer);

        Pipeline.Active = false;
        Renderer.Render(false);

        Pipeline.Active = true;
        Renderer.Render(scene);

        raf = requestAnimationFrame(render);
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

        clear(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    UWAL.Device.Destroy([
        curtainsBuffer,
        textBuffer
    ], textTexture);
}
