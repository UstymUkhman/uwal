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

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    BINDINGS,
    Geometries,
    TextureUtils,
    PerspectiveCamera
} from "#/index";

import SkyBox from "./SkyBox.wgsl";
import Market from "/assets/images/leadenhall";
import Envmap from "../environment-maps/Envmap.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "SkyBox"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new Scene();
    const Camera = new PerspectiveCamera();
    const CubeGeometry = new Geometries.Mesh();
    const CubePipeline = new Renderer.Pipeline();
    const SkyboxPipeline = new Renderer.Pipeline();
    const Texture = new (await TextureUtils(Renderer));

    const sampler = Texture.CreateSampler({ filter: "linear" });
    const cubeModule = CubePipeline.CreateShaderModule([Shaders.MeshVertex, Envmap]);
    const skyboxModule = SkyboxPipeline.CreateShaderModule([Shaders.Fullscreen, SkyBox]);
    const view = (await Texture.CreateCubeTexture(Market)).createView({ dimension: "cube" });

    let { inverseViewProjection, buffer: inverseViewProjectionBuffer } =
        SkyboxPipeline.CreateUniformBuffer("inverseViewProjection");

    CubeGeometry.Primitive = Geometries.Primitives.cube();
    const Cube = new Mesh(CubeGeometry);
    scene.Add(Cube);

    Cube.SetRenderPipeline(await Renderer.AddPipeline(CubePipeline,
        {
            fragment: CubePipeline.CreateFragmentState(cubeModule),
            depthStencil: CubePipeline.CreateDepthStencilState(),
            primitive: CubePipeline.CreatePrimitiveState(),
            vertex: CubePipeline.CreateVertexState(cubeModule, "vertexNormal", [
                CubeGeometry.GetPositionBufferLayout(CubePipeline),
                CubeGeometry.GetNormalBufferLayout(CubePipeline),
            ])
        }), [sampler, view, Camera.SetRenderPipeline(CubePipeline)],
        [0, 1, BINDINGS.CAMERA_MATRIX]
    );

    await Renderer.AddPipeline(SkyboxPipeline, {
        depthStencil: SkyboxPipeline.CreateDepthStencilState(void 0, void 0, "less-equal"),
        fragment: SkyboxPipeline.CreateFragmentState(skyboxModule),
        vertex: SkyboxPipeline.CreateVertexState(skyboxModule)
    });

    SkyboxPipeline.SetBindGroupFromResources([sampler, view, inverseViewProjectionBuffer]);
    CubeGeometry.AddNormalBuffer(CubePipeline, CubeGeometry.Primitive.normals);
    SkyboxPipeline.SetDrawParams(3);

    const position = [0, 0, 0];
    const rotation = [0, 0, 0];
    const origin = [0, 0, 0];
    Cube.Scaling = 2;

    function render(time)
    {
        time *= 0.0001;

        // Move the camera in circle from origin, looking at the origin:
        position[0] = Math.cos(time) * 5;
        position[2] = Math.sin(time) * 5;

        rotation[0] = time * -1;
        rotation[1] = time * -2;

        Camera.Position = position;
        Cube.Rotation = rotation;
        Camera.LookAt(origin);

        // Camera's `ViewProjectionMatrix` is updated by the `LookAt` method, but its `WorldMatrix` is not.
        // In this case it's not important to get the initial direction correct because it's rotating anyway.
        // For a better precision, call `UpdateViewProjectionMatrix()` before inverting `ViewProjectionMatrix`.
        inverseViewProjection = Camera.GetInverseViewProjectionMatrix(origin, inverseViewProjection);
        SkyboxPipeline.WriteBuffer(inverseViewProjectionBuffer, inverseViewProjection);

        CubePipeline.Active = true;
        Renderer.Render(scene, false);

        CubePipeline.Active = false;
        Renderer.Render();

        requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            scene.AddMainCamera(Camera);
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
