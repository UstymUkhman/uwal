/**
 * @example Skybox / Materials
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import FontURL from "/assets/fonts/Roboto-Regular.json?url";
import FontImage from "/assets/fonts/Roboto-Regular.png";
import Matcap from "/assets/images/matcap.png";
import Normal from "/assets/images/normal.jpg";
import Lines from "/assets/images/lines.png";
import Sky from "/assets/images/qwantani";
import * as UWAL from "#/index";

/** @type {number} */ let raf;
const Scene = new UWAL.Scene();
/** @type {Renderer} */ let Renderer;

/** @type {ResizeObserver} */ let observer;
const Camera = new UWAL.PerspectiveCamera();
/** @type {RenderPipeline} */ let SkyboxPipeline;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    await UWAL.Device.SetRequiredFeatures("bgra8unorm-storage");

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Skybox / Materials"));
    }
    catch (error)
    {
        alert(error);
    }

    const position = [0, 0, 0], rotation = [0, 0, 0], scaling = [1.25, 1.25, 1], origin = [0, 0, 0];
    const DiscGeometry = new UWAL.MeshGeometry({ name: "disc", args: { segments: 64, radius: 1.5 } });
    const PlaneGeometry = new UWAL.MeshGeometry({ name: "plane", args: { nx: 10, quads: true } });
    const CubeGeometry = new UWAL.MeshGeometry({ name: "roundedCube", args: { radius: 0.04 } });
    const FlatMaterial = new UWAL.FlatMaterial(Renderer, { colorMap: true });

    let dist = 5, lastTime = 0, time = UWAL.MathUtils.HPI;
    const Texture = new (await UWAL.Texture(Renderer));
    const Skybox = new UWAL.Skybox(Renderer, Camera);

    const Plane = new UWAL.Mesh(PlaneGeometry);
    const Disc = new UWAL.Mesh(DiscGeometry);
    const Cube = new UWAL.Mesh(CubeGeometry);

    Scene.Add([Plane, Disc, Cube]);
    const MaterialPipelines = [];
    Disc.Scaling = [0.5, 0.5, 1];
    Scene.AddMainCamera(Camera);

    async function start()
    {
        const sampler = Texture.CreateSampler();
        SkyboxPipeline = await Skybox.CreatePipeline();
        const depthStencil = SkyboxPipeline.CreateDepthStencilState();

        const cameraBuffer = Camera.SetRenderPipeline(FlatMaterial.Pipeline);
        Skybox.SetCubeTextureView(await Texture.CreateCubeTexture(Sky), sampler);
        const commonBindings = [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.COLOR];
        const colorTarget = SkyboxPipeline.CreateColorTargetState(UWAL.BLEND_STATE.ALPHA_ADDITIVE);

        await createMeshes(cameraBuffer, sampler, commonBindings, depthStencil, colorTarget);

        raf = requestAnimationFrame(render);
    }

    async function createMeshes(cameraBuffer, sampler, commonBindings, depthStencil, colorTarget)
    {
        const MatcapMaterial = new UWAL.MatcapMaterial(Renderer, { normalMap: true });
        const WireframeMaterial = new UWAL.WireframeMaterial(Renderer);

        const [, , , ...imageBitmaps] = await Promise.all(
        [
            MatcapMaterial.AddPipeline({ vertex: { buffers: [
                    CubeGeometry.GetPositionBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry()),
                    CubeGeometry.GetNormalBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry()),
                    CubeGeometry.GetUVBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry())
                ]},

                primitive: MatcapMaterial.Pipeline.CreatePrimitiveState(),
                depthStencil
            }),

            FlatMaterial.AddPipeline({ vertex: { buffers: [
                    DiscGeometry.GetPositionBufferLayout(FlatMaterial.Pipeline),
                    DiscGeometry.GetUVBufferLayout(FlatMaterial.Pipeline)
                ]},

                primitive: FlatMaterial.Pipeline.CreatePrimitiveState(void 0, "none"),
                fragment: { targets: [colorTarget] },
                depthStencil
            }),

            WireframeMaterial.AddPipeline({ vertex: { buffers: [
                PlaneGeometry.GetPositionBufferLayout(WireframeMaterial.Pipeline)
            ]}}),

            Texture.CreateImageBitmap(Lines),
            Texture.CreateImageBitmap(Normal),
            Texture.CreateImageBitmap(Matcap)
        ]);

        const [lines, normal, matcap] = await Promise.all(imageBitmaps.map(async (bitmap, b) =>
            await Texture.CopyImageToTexture(bitmap, { create: true, mipmaps: !!b })
        ));

        Plane.SetRenderPipeline(WireframeMaterial.Pipeline,
            [cameraBuffer, WireframeMaterial.ColorBuffer], commonBindings
        );

        Disc.SetRenderPipeline(FlatMaterial.Pipeline,
            [cameraBuffer, FlatMaterial.ColorBuffer, lines, sampler],
            [...commonBindings, UWAL.BINDINGS.COLOR_MAP, UWAL.BINDINGS.COLOR_MAP_SAMPLER]
        );

        Cube.SetRenderPipeline(MatcapMaterial.Pipeline,
            [cameraBuffer, MatcapMaterial.ColorBuffer, normal, sampler, matcap, sampler],
            [
                ...commonBindings,
                UWAL.BINDINGS.NORMAL_COLOR_MAP,
                UWAL.BINDINGS.NORMAL_MAP_SAMPLER,
                UWAL.BINDINGS.MATCAP_COLOR_MAP,
                UWAL.BINDINGS.MATCAP_MAP_SAMPLER
            ]
        );

        PlaneGeometry.CreateEdgeBuffer(WireframeMaterial.Pipeline, PlaneGeometry.Primitive?.cells, 4);
        MaterialPipelines.push(WireframeMaterial.Pipeline, FlatMaterial.Pipeline, MatcapMaterial.Pipeline);
    }

    function togglePipelines(active)
    {
        MaterialPipelines.forEach(Pipeline => Pipeline.Active = active);
    }

    function render(delta)
    {
        const x = Math.cos(time) * 0.25;
        const y = Math.cos(time - Math.PI) * 0.25;

        const r = Math.cos(time);
        const g = Math.sin(time - 0.5235);
        const b = Math.sin(time - 2.618);

        position[0] = Math.cos(time) * dist;
        position[2] = Math.sin(time) * dist;

        rotation[0] = time * -1;
        rotation[1] = time * -2;

        scaling[0] = x + 1.25;
        scaling[1] = y + 1.25;

        FlatMaterial.Color = [r, g, b];
        Camera.Position = position;
        Cube.Rotation = rotation;
        Plane.Scaling = scaling;
        Disc.Rotation[2] = time;
        Camera.LookAt(origin);

        SkyboxPipeline.DestroyPassEncoder = true;
        togglePipelines(false);
        Skybox.Render();

        SkyboxPipeline.DestroyPassEncoder = false;
        Skybox.Render();

        togglePipelines(true);
        Renderer.Render(Scene);

        raf = requestAnimationFrame(render);
        time += (delta - lastTime) * 1e-4;
        lastTime = delta;
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize: height } = entry.contentBoxSize[0];

            const sidebar = Math.max(width * 0.15, 240);
            dist = width <= 960 && 6 || -(width > 1440) + 5;
            width = (width <= 960 && width) || width - sidebar;

            Renderer.SetCanvasSize(width, height);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
            Texture.CreateMultisampleTexture();

            if (innerWidth <= 960)
            {
                Plane.Position = [-0.75,  1, 0];
                Disc.Position  = [ 0.75,  1, 0];
                Cube.Position  = [-0.75, -1, 0];
            }
            else
            {
                Plane.Position = [-2, 0, 0];
                Disc.Position  = [ 0, 0, 0];
                Cube.Position  = [ 2, 0, 0];
            }
        }

        cancelAnimationFrame(raf);
        raf && (raf = requestAnimationFrame(render)) || start();
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
    Scene.Destroy();
    UWAL.Device.Destroy();
}
