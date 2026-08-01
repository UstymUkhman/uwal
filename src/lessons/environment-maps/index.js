/**
 * @module Environment Maps
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Environment Maps
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-environment-maps.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Market from "/assets/images/leadenhall";
import Envmap from "./Envmap.wgsl";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Environment Maps"));
    }
    catch (error)
    {
        alert(error);
    }

    const Camera = new UWAL.PerspectiveCamera();
    const Geometry = new UWAL.Geometries.Mesh();
    const Pipeline = new Renderer.Pipeline();
    const Cube = new UWAL.Mesh(Geometry);
    const scene = new UWAL.Scene();

    Geometry.Primitive = "cube";
    const rotation = [0, 0, 0];
    Cube.Scaling = 2;
    scene.Add(Cube);

    const module = Pipeline.CreateShaderModule([UWAL.Shaders.MeshVertex, Envmap]);
    const Texture = new (await UWAL.TextureUtils(Renderer));
    const texture = await Texture.CreateCubeTexture(Market);

    Cube.SetRenderPipeline(await Renderer.AddPipeline(Pipeline,
        {
            primitive: Pipeline.CreatePrimitiveState(),
            fragment: Pipeline.CreateFragmentState(module),
            depthStencil: Pipeline.CreateDepthStencilState(),
            vertex: Pipeline.CreateVertexState(module, "vertexNormal", [
                Geometry.GetPositionBufferLayout(Pipeline),
                Geometry.GetNormalBufferLayout(Pipeline),
            ])
        }), [
            Texture.CreateSampler({ filter: "linear" }),
            texture.createView({ dimension: "cube" }),
            Camera.SetRenderPipeline(Pipeline)
        ],
        [0, 1, UWAL.BINDINGS.CAMERA_MATRIX]
    );

    function render(time)
    {
        time *= 0.001;

        rotation[0] = time * -0.1;
        rotation[1] = time * -0.2;
        Cube.Rotation = rotation;

        Renderer.Render(scene);
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
            Camera.LookAt([0, 0, 0]);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
