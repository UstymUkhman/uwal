/**
 * @module Primitive Geometry
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is inspired by dmnsgn's "Primitive Geometry"
 * {@link https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.4
 * @license MIT
 */

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    Geometries,
    PerspectiveCamera
} from "#/index";

import CubeShader from "./Cube.wgsl";
import UV from "/assets/images/uv.jpg";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Primitive Geometry"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new Scene();
    const Camera = new PerspectiveCamera();
    const Pipeline = new Renderer.Pipeline();
    const Texture = new (await Device.Texture(Renderer));

    const Geometry = new Geometries.Mesh("Cube", "uint16");
    Geometry.Primitive = Geometries.Primitives.cube();
    const Cube = new Mesh(Geometry, null);

    Cube.Transform = [[0, 0, -2.5], [0.625, -0.75, 0]];
    const source = await Texture.CreateImageBitmap(UV);
    const texture = await Texture.CopyImageToTexture(source);
    const module = Pipeline.CreateShaderModule([Shaders.MeshVertex, CubeShader]);

    const vertexBuffers = [
        Geometry.GetPositionBufferLayout(Pipeline, "vertexNormalUV"),
        Geometry.GetNormalBufferLayout(Pipeline, "vertexNormalUV"),
        Geometry.GetUVBufferLayout(Pipeline, "vertexNormalUV")
    ];

    Cube.SetRenderPipeline(await Renderer.AddPipeline(Pipeline, {
        vertex: Pipeline.CreateVertexState(module, vertexBuffers, "vertexNormalUV"),
        depthStencil: Pipeline.CreateDepthStencilState(),
        fragment: Pipeline.CreateFragmentState(module),
        primitive: Pipeline.CreatePrimitiveState()
    }), [
        Texture.CreateSampler(),
        texture.createView()
    ]);

    scene.Add(Cube);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
            scene.AddCamera(Camera);
        }

        Renderer.Render(scene);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
