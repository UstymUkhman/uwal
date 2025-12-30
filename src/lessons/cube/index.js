/**
 * @module Primitive Geometry
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is inspired by dmnsgn's "Primitive Geometry"
 * {@link https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import { Mesh, Scene, Device, Shaders, Geometries, PerspectiveCamera } from "#/index";
import CubeShader from "./Cube.wgsl";

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

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const scene = new Scene();
    const Camera = new PerspectiveCamera();
    const Pipeline = new Renderer.Pipeline();

    const Geometry = new Geometries.Mesh("Cube", "uint16");
    Geometry.Primitive = Geometries.Primitives.cube();

    const Cube = new Mesh(Geometry, null);
    const vertexEntry = [void 0, "meshVertex"];

    Cube.Transform = [[0, 0, -2.5], [0.625, -0.75, 0]];
    const module = Pipeline.CreateShaderModule([Shaders.MeshVertex, CubeShader]);

    const vertexBuffers = [
        Pipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }, ...vertexEntry),
        Pipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" }, ...vertexEntry)
    ];

    Cube.SetRenderPipeline(await Renderer.AddPipeline(Pipeline, {
        fragment: Pipeline.CreateFragmentState(module, void 0, void 0, "meshFragment"),
        vertex: Pipeline.CreateVertexState(module, vertexBuffers, ...vertexEntry),
        depthStencil: Pipeline.CreateDepthStencilState(),
        primitive: Pipeline.CreatePrimitiveState()
    }));

    const normalBuffer = Pipeline.CreateVertexBuffer(Geometry.Primitive.normals);
    Pipeline.WriteBuffer(normalBuffer, Geometry.Primitive.normals);
    Pipeline.AddVertexBuffers(normalBuffer);
    scene.Add(Cube);

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
