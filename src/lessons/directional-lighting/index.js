/**
 * @module Directional Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Directional Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-directional.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
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
    DirectionalLight,
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

    const scene = new Scene();
    const gui = new GUI();
    gui.onChange(render);

    const Camera = new PerspectiveCamera();
    const FGeometry = new Geometries.Mesh();
    const FMesh = new Mesh(FGeometry, null);
    const FPipeline = new Renderer.Pipeline();
    const vertexEntry = [void 0, "meshVertex"];

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const settings = { rotation: MathUtils.DegreesToRadians(0) };
    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const module = FPipeline.CreateShaderModule([Shaders.Light, Shaders.MeshVertex, FShader]);
    const { uniforms, buffer } = FPipeline.CreateUniformBuffer("uniforms");

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }, ...vertexEntry),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" }, ...vertexEntry)
    ];

    const { vertexData, normalData, vertices } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        vertex: FPipeline.CreateVertexState(module, vertexBuffers, ...vertexEntry),
        depthStencil: FPipeline.CreateDepthStencilState(),
        fragment: FPipeline.CreateFragmentState(module),
        primitive: FPipeline.CreatePrimitiveState()
    }), buffer);

    const direction = MathUtils.Vec3.create(-0.5, -0.7, -1);
    uniforms.light.set(new DirectionalLight(direction).Direction);
    uniforms.color.set(new Color(0x33ff33).rgba);
    FPipeline.WriteBuffer(buffer, uniforms.light.buffer);

    FGeometry.CreateVertexBuffer(FPipeline, vertexData);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    gui.add(settings, "rotation", radToDegOptions);

    FPipeline.AddVertexBuffers(normalBuffer);
    FGeometry.SetDrawParams(vertices);
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
