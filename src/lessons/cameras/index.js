/**
 * @module Cameras
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Cameras
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-cameras.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import { Device, Utils } from "#/index";
import { mat4 } from "wgpu-matrix";
import Camera from "./Camera.wgsl";
import createVertices from "./F";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.RenderPipeline(
            canvas, "Cameras", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const radToDegOptions =
    {
        min: -360,
        max: 360,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const Fs = 5, radius = 200;
    const settings = { fieldOfView: 100, cameraAngle: 0 };
    const objectUniforms = [], gui = new GUI().onChange(render);

    gui.add(settings, "fieldOfView", { min: 1, max: 179 }).name("Field of View");
    gui.add(settings, 'cameraAngle', radToDegOptions).name("Camera Angle");

    const { vertexData, vertices } = createVertices();
    const module = Renderer.CreateShaderModule(Camera);

    const { layout, buffer: vertexBuffer } = Renderer.CreateVertexBuffer([
        { name: "position", format: "float32x3" },
        { name: "color", format: "unorm8x4" }
    ], vertices);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, void 0, layout),
        depthStencil: Renderer.CreateDepthStencilState(),
        fragment: Renderer.CreateFragmentState(module),
        primitive: { cullMode: "back" }
    });

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        void 0,
        Renderer.CreateDepthAttachment()
    );

    Renderer.WriteBuffer(vertexBuffer, vertexData);
    Renderer.SetVertexBuffers(vertexBuffer);
    Renderer.Depth = 400;

    for (let f = 0; f < Fs; ++f)
    {
        const Uniforms = Renderer.CreateUniformBuffer("projection");

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    { buffer: Uniforms.buffer }
                ])
            )
        );

        objectUniforms.push(Uniforms);
    }

    function render()
    {
        // Compute a common projection matrix for all the "F"s:
        const projection = Renderer.UpdatePerspectiveProjection(settings.fieldOfView, 1, 2000);

        // Compute a camera matrix based on its distance:
        const cameraMatrix = mat4.rotationY(settings.cameraAngle);
        mat4.translate(cameraMatrix, [0, 0, radius * 1.5], cameraMatrix);

        // Compute a "view matrix" from the camera matrix:
        const viewMatrix = mat4.inverse(cameraMatrix);

        // Combine the view and projection matrices:
        const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);

        objectUniforms.forEach(({ projection, buffer }, f) =>
        {
            const angle = f / Fs * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Translate each "F" by `x` and `z` and update its projection matrix:
            mat4.translate(viewProjectionMatrix, [x, 0, z], projection);

            Renderer.WriteBuffer(buffer, projection);
            Renderer.SetActiveBindGroups(f);
            Renderer.Render(vertices, false);
        });

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
