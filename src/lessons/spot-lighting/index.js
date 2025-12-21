/**
 * @module Spot Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Spot Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-spot.html}&nbsp;
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
    PerspectiveCamera
} from "#/index";

import FShader from "./F.wgsl";
import createVertices from "../directional-lighting/F.js";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Spot Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new Scene();
    const gui = new GUI();
    gui.onChange(render);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const Camera = new PerspectiveCamera();
    const FGeometry = new Geometries.Mesh();
    const FPipeline = new Renderer.Pipeline();
    const vertexEntry = [void 0, "meshVertex"];

    const settings = {
        innerLimit: MathUtils.DegreesToRadians(15),
        outerLimit: MathUtils.DegreesToRadians(25),
        rotation: MathUtils.DegreesToRadians(0),
        aimOffsetX: -10,
        aimOffsetY: 10,
        shininess: 30
    };

    const module = FPipeline.CreateShaderModule([Shaders.Light, Shaders.Mesh, FShader]);
    const { uniforms, buffer } = FPipeline.CreateUniformBuffer("uniforms");
    const FMesh = new Mesh(FGeometry, new Materials.Color(0x33ff33));

    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const limitOptions = { min: 0, max: 90, minRange: 1, step: 1, converters: GUI.converters.radToDeg };

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }, ...vertexEntry),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" }, ...vertexEntry)
    ];

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        fragment: FPipeline.CreateFragmentState(module, void 0, void 0, "meshFragment"),
        vertex: FPipeline.CreateVertexState(module, vertexBuffers, ...vertexEntry),
        depthStencil: FPipeline.CreateDepthStencilState(),
        primitive: FPipeline.CreatePrimitiveState()
    }), buffer);

    const { vertexData, normalData, vertices } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);

    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings, "shininess", { min: 1, max: 250 });
    GUI.makeMinMaxPair(gui, settings, "innerLimit", "outerLimit", limitOptions);
    gui.add(settings, "aimOffsetX", -50, 50);
    gui.add(settings, "aimOffsetY", -50, 50);

    FGeometry.CreateVertexBuffer(FPipeline, vertexData);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    FPipeline.AddVertexBuffers(normalBuffer);
    FGeometry.SetDrawParams(vertices);

    uniforms.light.set([-10, 30, 100]);
    const cameraTarget = [0, 35, 0];
    scene.Add(FMesh);

    function render()
    {
        uniforms.camera.set(Camera.Position);
        uniforms.intensity[0] = settings.shininess;

        uniforms.limit[0] = Math.cos(settings.innerLimit);
        uniforms.limit[1] = Math.cos(settings.outerLimit);

        const { aimOffsetX: x, aimOffsetY: y } = settings;

        // Point the spot light at the camera target (FMesh) + settings offsets:
        const target = [cameraTarget[0] + x, cameraTarget[1] + y, cameraTarget[2]];

        // Get the Z axis from the target matrix and negate it because `lookAt` looks down the -Z axis:
        uniforms.direction.set(MathUtils.Mat4.aim(uniforms.light, target, [0, 1, 0]).slice(8, 11));

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
            Camera.LookAt(cameraTarget);
            scene.AddCamera(Camera);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
