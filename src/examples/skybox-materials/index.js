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

    const Labels = [], position = [0, 0, 0], rotation = [0, 0, 0], scaling = [1.25, 1.25, 1], origin = [0, 0, 0];
    const DiscGeometry = new UWAL.MeshGeometry({ name: "disc", args: { segments: 64, radius: 1.5 } });
    const PlaneGeometry = new UWAL.MeshGeometry({ name: "plane", args: { nx: 10, quads: true } });
    const CubeGeometry = new UWAL.MeshGeometry({ name: "roundedCube", args: { radius: 0.04 } });

    let time = UWAL.MathUtils.HPI, lastTime = 0, dist = 0, lastDist = 0, timeout;
    const FlatMaterial = new UWAL.FlatMaterial(Renderer, { colorMap: true });
    const Texture = new (await UWAL.Texture(Renderer));
    const Skybox = new UWAL.Skybox(Renderer, Camera);

    const Plane = new UWAL.Mesh(PlaneGeometry);
    const Disc = new UWAL.Mesh(DiscGeometry);
    const Cube = new UWAL.Mesh(CubeGeometry);

    Scene.Add([Plane, Disc, Cube]);
    const MaterialPipelines = [];
    Disc.Scaling = [0.5, 0.5, 1];
    Scene.AddMainCamera(Camera);

    async function start(labels = dist !== lastDist)
    {
        if (raf && labels)
        {
            Renderer.RemovePipeline(
                MaterialPipelines.pop()
            );

            for (let l = Labels.length; l--; )
                Labels[l].Destroy();

            Scene.Remove(Labels);
            Labels.splice(0);
        }
        else if (!raf)
        {
            SkyboxPipeline = await Skybox.CreatePipeline();
            const sky = await Texture.CreateCubeTexture(Sky);
            Skybox.SetCubeTextureView(sky, Texture.CreateSampler());
        }

        const Common = {
            sampler: Texture.CreateSampler(),
            depthStencil: SkyboxPipeline.CreateDepthStencilState(),
            bindings: [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.COLOR],
            cameraBuffer: Camera.SetRenderPipeline(FlatMaterial.Pipeline),
            colorTarget: SkyboxPipeline.CreateColorTargetState(UWAL.BLEND_STATE.ALPHA_ADDITIVE)
        };

        if (labels)
        {
            lastDist = dist;
            await createLabels(Common);
        }

        !raf && await createMeshes(Common);
        raf = requestAnimationFrame(render);
    }

    async function createLabels(Common)
    {
        const WHITE = 0xffffff;
        const Text = new UWAL.MSDFText();
        const Geometry = new UWAL.MeshGeometry("quad");

        const fov = UWAL.MathUtils.DegreesToRadians(Camera.FieldOfView);
        const Material = new UWAL.FlatMaterial(Renderer, { colorMap: true });
        const TextCamera = new UWAL.PerspectiveCamera(void 0, void 0, void 0, Renderer);

        const TextPipeline = await Text.CreatePipeline(Renderer, { depthStencil: Common.depthStencil });
        SkyboxPipeline.DestroyPassEncoder = TextPipeline.DestroyPassEncoder = true;
        Text.CameraMatrixBuffer = TextCamera.SetRenderPipeline(TextPipeline);

        togglePipelines(false);
        await Text.LoadFont(FontURL);

        let flat = Text.Write("Flat", WHITE);
        let matcap = Text.Write("Matcap", WHITE);
        let wireframe = Text.Write("Wireframe", WHITE);

        MaterialPipelines.push(await Material.AddPipeline({
            depthStencil: Common.depthStencil,
            fragment: { targets: [Common.colorTarget] },
            primitive: Material.Pipeline.CreatePrimitiveState(void 0, "front"),

            vertex: { buffers: [
                Geometry.GetPositionBufferLayout(Material.Pipeline),
                Geometry.GetUVBufferLayout(Material.Pipeline)
            ]}
        }));

        const translation = UWAL.MathUtils.Mat4.identity();
        const height = Math.tan(fov * 0.5) * 2 * dist;
        const width = Camera.AspectRatio * height;

        for (let l = 0; l < 2; ++l)
        {
            const Label = new UWAL.Mesh(Geometry);

            TextPipeline.TextureView = Texture.CreateStorageTexture({ usage: GPUTextureUsage.RENDER_ATTACHMENT });

            Label.SetRenderPipeline(Material.Pipeline,
                [Common.cameraBuffer, Material.ColorBuffer, TextPipeline.TextureView, Common.sampler],
                [...Common.bindings, UWAL.BINDINGS.COLOR_MAP, UWAL.BINDINGS.COLOR_MAP_SAMPLER]
            );

            if (innerWidth <= 960)
            {
                UWAL.MathUtils.Mat4.translation([l && -2.25 || 0.25, 3, -10], translation);
                Text.SetTranslation(translation, wireframe);

                UWAL.MathUtils.Mat4.translation([l && 0.85 || -1.65, 3, -10], translation);
                Text.SetTranslation(translation, flat);

                UWAL.MathUtils.Mat4.translation([l && -2 || 0.5, -0.5, -10], translation);
                Text.SetTranslation(translation, matcap);
            }
            else
            {
                const z = dist < 5 && -8 || -9;
                const y = dist < 5 && 1.65 || 1.5;
                const x = l ? dist < 5 && [-5, 3.5] || [-4.62, 3] : dist < 5 && [3, -5] || [2.6, -4.62];

                UWAL.MathUtils.Mat4.translation([x[0], y, z], translation);
                Text.SetTranslation(translation, wireframe);

                UWAL.MathUtils.Mat4.translation([-0.4, y, z], translation);
                Text.SetTranslation(translation, flat);

                UWAL.MathUtils.Mat4.translation([x[1], y, z], translation);
                Text.SetTranslation(translation, matcap);
            }

            Label.Position[2] = (l * 2 - 1) * -0.01;
            Label.Rotation[1] = Math.PI * (~l + 2);
            Label.Scaling = [width, -height, 1];

            Labels.push(Label);
            Scene.Add(Label);
            Skybox.Render();
            Text.Clear();

            flat = Text.Write("Flat", WHITE);
            matcap = Text.Write("Matcap", WHITE);
            wireframe = Text.Write("Wireframe", WHITE);
        }

        Renderer.Render(Scene);
        wireframe.destroy();
        matcap.destroy();
        flat.destroy();

        Renderer.RemovePipeline(TextPipeline);
        SkyboxPipeline.DestroyPassEncoder = false;
    }

    async function createMeshes(Common)
    {
        const MatcapMaterial = new UWAL.MatcapMaterial(Renderer, { normalMap: true });
        const WireframeMaterial = new UWAL.WireframeMaterial(Renderer);

        const [, , , ...imageBitmaps] = await Promise.all(
        [
            MatcapMaterial.AddPipeline({
                depthStencil: Common.depthStencil,
                primitive: MatcapMaterial.Pipeline.CreatePrimitiveState(),

                vertex: { buffers: [
                    CubeGeometry.GetPositionBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry()),
                    CubeGeometry.GetNormalBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry()),
                    CubeGeometry.GetUVBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry())
                ]}
            }),

            FlatMaterial.AddPipeline({
                depthStencil: Common.depthStencil,
                fragment: { targets: [Common.colorTarget] },
                primitive: FlatMaterial.Pipeline.CreatePrimitiveState(void 0, "none"),

                vertex: { buffers: [
                    DiscGeometry.GetPositionBufferLayout(FlatMaterial.Pipeline),
                    DiscGeometry.GetUVBufferLayout(FlatMaterial.Pipeline)
                ]}
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
            [Common.cameraBuffer, WireframeMaterial.ColorBuffer], Common.bindings
        );

        Disc.SetRenderPipeline(FlatMaterial.Pipeline,
            [Common.cameraBuffer, FlatMaterial.ColorBuffer, lines, Common.sampler],
            [...Common.bindings, UWAL.BINDINGS.COLOR_MAP, UWAL.BINDINGS.COLOR_MAP_SAMPLER]
        );

        Cube.SetRenderPipeline(MatcapMaterial.Pipeline,
            [Common.cameraBuffer, MatcapMaterial.ColorBuffer, normal, Common.sampler, matcap, Common.sampler],
            [
                ...Common.bindings,
                UWAL.BINDINGS.NORMAL_COLOR_MAP,
                UWAL.BINDINGS.NORMAL_MAP_SAMPLER,
                UWAL.BINDINGS.MATCAP_COLOR_MAP,
                UWAL.BINDINGS.MATCAP_MAP_SAMPLER
            ]
        );

        PlaneGeometry.CreateEdgeBuffer(WireframeMaterial.Pipeline, PlaneGeometry.Primitive?.cells, 4);
        MaterialPipelines.unshift(WireframeMaterial.Pipeline, FlatMaterial.Pipeline, MatcapMaterial.Pipeline);
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

        togglePipelines(false);
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

        clearTimeout(timeout);
        cancelAnimationFrame(raf);
        timeout = setTimeout(start, 50);
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
    raf = void 0;
    UWAL.Device.Destroy();
}
