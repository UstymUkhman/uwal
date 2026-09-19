/**
 * @module SkyBox
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU SkyBox
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-skybox.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Envmap from "../environment-maps/Envmap.wgsl";
import Market from "/assets/images/leadenhall";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "SkyBox"));
    }
    catch (error)
    {
        alert(error);
    }

    const Texture = new (await UWAL.Texture(Renderer));
    const CubeGeometry = new UWAL.MeshGeometry("cube");
    const SkyboxPipeline = new Renderer.Pipeline();
    const CubePipeline = new Renderer.Pipeline();
    const Camera = new UWAL.PerspectiveCamera();

    const Skybox = new UWAL.Skybox(Renderer, Camera);
    const Cube = new UWAL.Mesh(CubeGeometry);
    const sampler = Texture.CreateSampler();

    const Scene = new UWAL.Scene();
    await Skybox.CreatePipeline();
    Cube.Scaling = 2;
    Scene.Add(Cube);

    const position = [0, 0, 0], rotation = [0, 0, 0], origin = [0, 0, 0];
    const cubeModule = CubePipeline.CreateShaderModule([UWAL.Shaders.MeshVertex, Envmap]);
    const view = Skybox.SetCubeTextureView(await Texture.CreateCubeTexture(Market), sampler);

    Cube.SetRenderPipeline(await Renderer.AddPipeline(CubePipeline,
        {
            fragment: CubePipeline.CreateFragmentState(cubeModule),
            depthStencil: CubePipeline.CreateDepthStencilState(),
            primitive: CubePipeline.CreatePrimitiveState(),
            vertex: CubePipeline.CreateVertexState(cubeModule, "vertexNormal", [
                CubeGeometry.GetPositionBufferLayout(CubePipeline),
                CubeGeometry.GetNormalBufferLayout(CubePipeline)
            ])
        }),
        [sampler, view, Camera.SetRenderPipeline(CubePipeline)],
        [0, 1, UWAL.BINDINGS.CAMERA_MATRIX]
    );

    function render(time)
    {
        time *= 0.0001;

        // Move the camera in circle from the origin, looking at the origin:
        position[0] = Math.cos(time) * 5;
        position[2] = Math.sin(time) * 5;

        rotation[0] = time * -1;
        rotation[1] = time * -2;

        Camera.Position = position;
        Cube.Rotation = rotation;
        Camera.LookAt(origin);

        CubePipeline.Active = true;
        Renderer.Render(Scene, false);

        CubePipeline.Active = false;
        Skybox.Render(true);

        requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Scene.AddMainCamera(Camera);
            Camera.Position = [0, 0, 4];
            Camera.LookAt(origin);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
