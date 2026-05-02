/**
 * @module SkyBox
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU SkyBox
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-skybox.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.4.0
 * @license MIT
 */

import {
    Mesh,
    Color,
    Scene,
    Device,
    Shaders,
    MathUtils,
    Geometries,
    PerspectiveCamera
} from "#/index";

import SkyBox from "./SkyBox.wgsl";
import Market from "/assets/images/leadenhall";

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

    const Geometry = new Geometries.Mesh();
    const Pipeline = new Renderer.Pipeline();
    Geometry.Primitive = Geometries.Primitives.cube();

    const Camera = new PerspectiveCamera();
    const Sky = new Mesh(Geometry);
    const scene = new Scene();
    scene.Add(Sky);

    const Texture = new (await Device.Texture(Renderer));
    const texture = await Texture.CreateCubeTexture(Market);
    const module = Pipeline.CreateShaderModule([Shaders.Fullscreen, SkyBox]);

    let { inverseViewProjection, buffer: inverseViewProjectionBuffer } =
        Pipeline.CreateUniformBuffer("inverseViewProjection");

    await Renderer.AddPipeline(Pipeline, {
        depthStencil: Pipeline.CreateDepthStencilState(void 0, void 0, "less-equal"),
        fragment: Pipeline.CreateFragmentState(module),
        primitive: Pipeline.CreatePrimitiveState(),
        vertex: Pipeline.CreateVertexState(module)
    });

    Pipeline.SetBindGroupFromResources([
        Texture.CreateSampler({ filter: "linear" }),
        texture.createView({ dimension: "cube" }),
        inverseViewProjectionBuffer
    ]);

    Pipeline.SetDrawParams(3);

    const position = [0, 0, 0];
    const origin = [0, 0, 0];

    function render(time)
    {
        time *= 0.001;

        // Move the camera in circle from origin, looking at the origin:
        position[0] = Math.cos(time * 0.1);
        position[2] = Math.sin(time * 0.1);

        Camera.Position = position;
        Camera.LookAt(origin);

        // Camera's `ViewProjectionMatrix` is updated by the `LookAt` method, but its `WorldMatrix` is not.
        // In this case it's not important to get the initial direction correct because it's rotating anyway.
        // For a better precision, call `UpdateViewProjectionMatrix()` before inverting `ViewProjectionMatrix`.
        inverseViewProjection = Camera.GetInverseViewProjectionMatrix(origin, inverseViewProjection);

        Pipeline.WriteBuffer(inverseViewProjectionBuffer, inverseViewProjection);

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
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
