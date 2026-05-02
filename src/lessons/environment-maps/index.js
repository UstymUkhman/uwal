/**
 * @module Environment maps
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Environment Maps
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-environment-maps.html}&nbsp;
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
    Geometries,
    PerspectiveCamera
} from "#/index";

import Envmap from "./Envmap.wgsl";
import Market from "/assets/images/leadenhall";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Environment maps"));
    }
    catch (error)
    {
        alert(error);
    }

    const Geometry = new Geometries.Mesh();
    const Pipeline = new Renderer.Pipeline();
    Geometry.Primitive = Geometries.Primitives.cube();

    const Camera = new PerspectiveCamera();
    const Cube = new Mesh(Geometry);
    const scene = new Scene();
    scene.Add(Cube);

    const module = Pipeline.CreateShaderModule([Shaders.MeshVertex, Envmap]);
    const Texture = new (await Device.Texture(Renderer));
    const texture = await Texture.CreateCubeTexture(Market);

    Cube.SetRenderPipeline(await Renderer.AddPipeline(Pipeline,
        {
            fragment: Pipeline.CreateFragmentState(module),
            depthStencil: Pipeline.CreateDepthStencilState(),
            primitive: Pipeline.CreatePrimitiveState(),
            vertex: Pipeline.CreateVertexState(module, "vertexNormal", [
                Geometry.GetPositionBufferLayout(Pipeline),
                Geometry.GetNormalBufferLayout(Pipeline),
            ])
        }), [
            Texture.CreateSampler({ filter: "linear" }),
            texture.createView({ dimension: "cube" }),
            Camera.SetRenderPipeline(Pipeline)
        ],
        [0, 1, BINDINGS.CAMERA_MATRIX]
    );

    Geometry.AddNormalBuffer(Pipeline, Geometry.Primitive.normals);
    const rotation = [0, 0, 0];
    Cube.Scaling = 2;

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
