/**
 * @module Directional Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Directional Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-directional.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    Materials,
    Geometries,
    PerspectiveCamera
} from "#/index";

import FShader from "./F.wgsl";
import createVertices from "./F.js";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Directional Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const Camera = new PerspectiveCamera();
    const FGeometry = new Geometries.Mesh();
    const FPipeline = new Renderer.Pipeline();

    const shaderModule = FPipeline.CreateShaderModule(FShader);
    const FMesh = new Mesh(FGeometry, new Materials.Color(0xffffff));

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" })
    ];

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        vertex: FPipeline.CreateVertexState(shaderModule, vertexBuffers),
        fragment: FPipeline.CreateFragmentState(shaderModule),
        primitive: FPipeline.CreatePrimitiveState()
    }));

    const { vertexData, indexData, normalData } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);

    FGeometry.CreateVertexBuffer(FPipeline, vertexData);
    FGeometry.CreateIndexBuffer(FPipeline, indexData);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    FPipeline.AddVertexBuffers(normalBuffer);

    FMesh.Position = [0, 0, -400];
    const scene = new Scene();
    scene.AddCamera(Camera);
    scene.Add(FMesh);

    function render()
    {
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
            scene.AddCamera(Camera);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
