/**
 * @module Directional Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Directional Lighting
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-lighting-directional.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import FShader from "./F.wgsl";
import * as UWAL from "#/index";
import createVertices from "./F.js";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Directional Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const FGeometry = new UWAL.Geometries.Mesh();
    const Camera = new UWAL.PerspectiveCamera();
    const FPipeline = new Renderer.Pipeline();
    const FMesh = new UWAL.Mesh(FGeometry);

    const scene = new UWAL.Scene();
    const gui = new GUI();
    gui.onChange(render);
    scene.Add(FMesh);

    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const module = FPipeline.CreateShaderModule([UWAL.Shaders.Mesh, UWAL.Shaders.Light, FShader]);
    const { color, buffer: colorBuffer } = FMesh.CreateColorBuffer(FPipeline);

    const settings = { rotation: UWAL.MathUtils.DegreesToRadians(0) };
    const Light = new UWAL.DirectionalLight([-0.5, -0.7, -1]);

    gui.add(settings, "rotation", radToDegOptions);
    color.set(new UWAL.Color(0x33ff33).rgba);

    FMesh.SetRenderPipeline(await Renderer.AddPipeline(FPipeline,
        {
            fragment: FPipeline.CreateFragmentState(module, "FFragment"),
            depthStencil: FPipeline.CreateDepthStencilState(),
            primitive: FPipeline.CreatePrimitiveState(),
            vertex: FPipeline.CreateVertexState(module, "vertexNormal", [
                FGeometry.GetPositionBufferLayout(FPipeline),
                FGeometry.GetNormalBufferLayout(FPipeline)
            ])
        }),
        [Camera.SetRenderPipeline(FPipeline), colorBuffer, Light.SetRenderPipeline(FPipeline)],
        [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.MESH_COLOR, UWAL.BINDINGS.DIRECTIONAL_LIGHT]
    );

    const { positionData, normalData, vertices } = createVertices();
    const normalBuffer = FPipeline.CreateVertexBuffer(normalData);
    FGeometry.CreatePositionBuffer(FPipeline, positionData);

    FPipeline.WriteBuffer(colorBuffer, color.buffer);
    FPipeline.WriteBuffer(normalBuffer, normalData);
    FPipeline.AddVertexBuffers(normalBuffer);
    FGeometry.SetDrawParams(vertices);

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
            Camera.Position = [100, 150, 200];
            Camera.LookAt([0, 35, 0]);
            scene.AddMainCamera(Camera);
            Camera.UpdateWorldMatrix(true);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
