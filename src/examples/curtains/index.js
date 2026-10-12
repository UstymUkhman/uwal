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
/** @type {GPUBuffer} */ let curtainsBuffer;
const canvas = document.getElementById("preview");

try
{
    await UWAL.Device.SetRequiredFeatures("bgra8unorm-storage");
    Renderer = new (await UWAL.Renderer(canvas, "Curtains"));
}
catch (error)
{
    alert(error);
}

const Text = new UWAL.MSDFText();
let maxDelta = 4, delta = 0, time = 0;
const Pipeline = new Renderer.Pipeline();
const Camera = new UWAL.PerspectiveCamera(35);

const Geometry = new UWAL.MeshGeometry({ name: "plane", args: { nx: 50, ny: 37 } });
const module = Pipeline.CreateShaderModule([UWAL.Shaders.MeshVertex, Curtains]);
const { curtains, buffer } = Pipeline.CreateUniformBuffer("curtains");

const TextPipeline = await Text.CreatePipeline(Renderer, {
    multisample: Pipeline.CreateMultisampleState()
});

const cameraBuffer = Camera.SetRenderPipeline(Pipeline);
const Texture = new (await UWAL.Texture(Renderer));

const mousePosition = UWAL.MathUtils.Vec2.create();
const lastPosition = UWAL.MathUtils.Vec2.create();

const logo = await Texture.CopyImageToTexture(
    await Texture.CreateImageBitmap(Logo),
    { mipmaps: false, flipY: false }
);

canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("touchmove", onMove);

const Scene = new UWAL.Scene("Curtains");
const Plane = new UWAL.Mesh(Geometry);

await Text.LoadFont(FontURL);
Scene.AddMainCamera(Camera);
curtainsBuffer = buffer;
Scene.Add(Plane);

function onMove()
{
    let x = event.touches?.[0].clientX ?? event.offsetX;
    let y = event.touches?.[0].clientY ?? event.offsetY;

    UWAL.MathUtils.Vec2.copy(mousePosition, lastPosition);

    mousePosition[0] = UWAL.MathUtils.Lerp(mousePosition[0], x, 0.3);
    mousePosition[1] = UWAL.MathUtils.Lerp(mousePosition[1], y, 0.3);

    x =  mousePosition[0] / canvas.offsetWidth  * -2  + 1; // 1.0 -> -1.0
    y = (mousePosition[1] / canvas.offsetHeight +  1) / 2; // 0.5 ->  1.0

    curtains.mouse.set([x, y]);

    x = mousePosition[0] - lastPosition[0];
    y = mousePosition[1] - lastPosition[1];

    maxDelta = UWAL.MathUtils.Clamp(Math.hypot(x, y), maxDelta, 4);
}

function clean()
{
    Text.Clear(textBuffer);
    cancelAnimationFrame(raf);
    TextPipeline.TextureView?.destroy();
}

async function start()
{
    TextPipeline.TextureView = Texture.CreateStorageTexture({
        usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    const fov = UWAL.MathUtils.DegreesToRadians(Camera.FieldOfView);
    const scale = +(Renderer.BaseCanvasSize[0] <= 960) + 1;
    const height = Math.tan(fov * 0.5) * 2 * 1.45;
    const width = Camera.AspectRatio * height;

    Text.CameraMatrixBuffer = cameraBuffer;
    TextPipeline.DestroyPassEncoder = true;
    Plane.Scaling = [-width, -height, 1];
    curtains.ratio.set([width / height]);

    Text.SetTranslation(
        UWAL.MathUtils.Mat4.translation([0, scale * -0.5 - 0.25, scale * -3 - 2]),
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
            Geometry.GetUVBufferLayout(Pipeline)
        ])
    }), [
        cameraBuffer, buffer, logo,
        TextPipeline.TextureView,
        Texture.CreateSampler()
    ], [
        UWAL.BINDINGS.CAMERA_MATRIX, 0
    ]);

    raf = requestAnimationFrame(render);
}

function render()
{
    delta += (maxDelta - delta) * 0.02;
    maxDelta += maxDelta * -0.01;

    curtains.delta.set([delta, time++]);
    Pipeline.WriteBuffer(buffer, curtains.delta.buffer);

    Pipeline.Active = false;
    Renderer.Render(false);

    Pipeline.Active = true;
    Renderer.Render(Scene);

    raf = requestAnimationFrame(render);
}

export function resize(width)
{
    Renderer.SetCanvasSize(width, innerHeight);
    Camera.AspectRatio = Renderer.AspectRatio;
    Texture.CreateMultisampleTexture();
    Camera.Position = [0.0, 0.0, 1.5];
    Camera.UpdateWorldMatrix(true);
    clean(), start();
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    Renderer.Destroy();
    UWAL.Device.Destroy([
        curtainsBuffer,
        textBuffer
    ]);
}
