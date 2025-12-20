/**
 * @module Point Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Point Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-point.html}&nbsp;
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
    Materials,
    MathUtils,
    Geometries,
    PointLight,
    PerspectiveCamera
} from "#/index";

import FShader from "./F.wgsl";
import createVertices from "../directional-lighting/F.js";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Point Lighting"));
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
    const FPipeline = new Renderer.Pipeline();
    const vertexEntry = [void 0, "meshVertex"];

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const FMesh = new Mesh(FGeometry, new Materials.Color(0x33ff33));
    const module = FPipeline.CreateShaderModule([Shaders.Light, Shaders.Mesh, FShader]);
    const { uniforms, buffer } = FPipeline.CreateUniformBuffer("uniforms");

    const settings = { rotation: MathUtils.DegreesToRadians(0), shininess: 30 };
    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }, ...vertexEntry),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" }, ...vertexEntry)
    ];

    const { vertexData, normalData, vertices } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        fragment: FPipeline.CreateFragmentState(module, void 0, void 0, "meshFragment"),
        vertex: FPipeline.CreateVertexState(module, vertexBuffers, ...vertexEntry),
        depthStencil: FPipeline.CreateDepthStencilState(),
        primitive: FPipeline.CreatePrimitiveState()
    }), buffer);

    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings, "shininess", { min: 1, max: 250 });

    FGeometry.CreateVertexBuffer(FPipeline, vertexData);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    FPipeline.AddVertexBuffers(normalBuffer);
    FGeometry.SetDrawParams(vertices);

    const light = new PointLight([-10, 30, 100]);
    uniforms.light.set(light.Position);
    scene.Add(FMesh);

    function render()
    {
        uniforms.camera.set(Camera.Position);
        uniforms.intensity[0] = light.Intensity = settings.shininess;

        FPipeline.WriteBuffer(buffer, uniforms.light.buffer);
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
