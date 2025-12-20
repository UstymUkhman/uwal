/**
 * @module Point Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Point Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-point.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
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
    const FMesh = new Mesh(FGeometry, null);
    const FPipeline = new Renderer.Pipeline();

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const module = FPipeline.CreateShaderModule(FShader);
    const settings = { rotation: MathUtils.DegreesToRadians(0) };
    const { uniforms, buffer } = FPipeline.CreateUniformBuffer("uniforms");
    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

    const vertexBuffers = [
        FPipeline.CreateVertexBufferLayout({ name: "position", format: "float32x3" }),
        FPipeline.CreateVertexBufferLayout({ name: "normal", format: "float32x3" })
    ];

    const { vertexData, normalData, vertices } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline, {
        vertex: FPipeline.CreateVertexState(module, vertexBuffers),
        depthStencil: FPipeline.CreateDepthStencilState(),
        fragment: FPipeline.CreateFragmentState(module),
        primitive: FPipeline.CreatePrimitiveState()
    }), buffer);

    FGeometry.CreateVertexBuffer(FPipeline, vertexData);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    gui.add(settings, "rotation", radToDegOptions);
    FPipeline.AddVertexBuffers(normalBuffer);
    FGeometry.SetDrawParams(vertices);

    uniforms.color.set(new Color(0x33ff33).rgba);
    uniforms.light.set([-10, 30, 100]);
    scene.Add(FMesh);

    function render()
    {
        FMesh.Rotation = [0, settings.rotation, 0];
        const world = MathUtils.Mat4.rotationY(settings.rotation, uniforms.world);

        // Compute a world matrix, then inverse and transpose it into the normal matrix:
        MathUtils.Mat3.fromMat4(MathUtils.Mat4.transpose(MathUtils.Mat4.inverse(world)), uniforms.normal);

        FPipeline.WriteBuffer(buffer, uniforms.normal.buffer);

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
