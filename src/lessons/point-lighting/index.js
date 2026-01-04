/**
 * @module Point Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Point Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-point.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.4
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
    PointLight,
    Geometries,
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

    const module = FPipeline.CreateShaderModule([Shaders.Light, Shaders.Camera, Shaders.Mesh, FShader]);
    const { Camera: camera, buffer: cameraBuffer } = FPipeline.CreateUniformBuffer("Camera");
    const { Light, buffer: lightBuffer } = FPipeline.CreateUniformBuffer("Light");
    const FMesh = new Mesh(FGeometry, new Materials.Color(0x33ff33));

    const settings = { rotation: MathUtils.DegreesToRadians(0), shininess: 30 };
    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }, "meshVertex"),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" }, "meshVertex")
    ];

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        vertex: FPipeline.CreateVertexState(module, vertexBuffers, "meshVertex"),
        fragment: FPipeline.CreateFragmentState(module, void 0, "meshFragment"),
        depthStencil: FPipeline.CreateDepthStencilState(),
        primitive: FPipeline.CreatePrimitiveState()
    }), [lightBuffer, cameraBuffer]);

    const { positionData, normalData, vertices } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);

    FGeometry.CreatePositionBuffer(FPipeline, positionData);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    FPipeline.AddVertexBuffers(normalBuffer);
    FGeometry.SetDrawParams(vertices);

    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings, "shininess", { min: 1, max: 250 });

    const light = new PointLight([-10, 30, 100]);
    Light.position.set(light.Position);
    scene.Add(FMesh);

    function render()
    {
        camera.position.set(Camera.Position);
        Light.intensity[0] = light.Intensity = settings.shininess;

        FPipeline.WriteBuffer(lightBuffer, Light.position.buffer);
        FPipeline.WriteBuffer(cameraBuffer, camera.position);

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
