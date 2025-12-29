/**
 * @module Primitive Geometry
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is inspired by dmnsgn's "Primitive Geometry"
 * {@link https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import {
    Mesh,
    Color,
    Scene,
    Device,
    Shaders,
    Materials,
    MathUtils,
    Geometries,
    PerspectiveCamera
} from "#/index";

import CubeShader from "./Cube.wgsl";
import * as Primitives from "primitive-geometry";
import createVertices from "../directional-lighting/F.js";

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

    Primitives.utils.setTypedArrayType(Uint16Array);
    const vertexEntry = [void 0, "meshVertex"];
    const FPipeline = new Renderer.Pipeline();
    const Camera = new PerspectiveCamera();
    const Cube = Primitives.cube();
    const scene = new Scene();

    const FGeometry = new Geometries.Mesh("Cube", "uint16");
    FGeometry.CreateIndexBuffer(FPipeline, Cube.cells);
    const FMesh = new Mesh(FGeometry, null);

    const settings = { rotation: MathUtils.DegreesToRadians(0) };
    const module = FPipeline.CreateShaderModule([Shaders.MeshVertex, CubeShader]);

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }, ...vertexEntry),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" }, ...vertexEntry)
    ];

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        fragment: FPipeline.CreateFragmentState(module, void 0, void 0, "meshFragment"),
        vertex: FPipeline.CreateVertexState(module, vertexBuffers, ...vertexEntry),
        depthStencil: FPipeline.CreateDepthStencilState(),
        primitive: FPipeline.CreatePrimitiveState()
    }));

    const normalBuffer = FPipeline.CreateVertexBuffer(Cube.normals);
    FGeometry.CreateVertexBuffer(FPipeline, Cube.positions);
    FPipeline.WriteBuffer(normalBuffer, Cube.normals);
    FPipeline.AddVertexBuffers(normalBuffer);

    FMesh.Scaling = [100, 100, 100];
    FMesh.Position = [0, 50, 0];
    scene.Add(FMesh);

    function render()
    {
        FMesh.Rotation = [0, settings.rotation, 0];
        Renderer.Render(scene);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
            Camera.Position = [100, 150, 200];
            Camera.LookAt([0, 35, 0]);
            scene.AddCamera(Camera);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
