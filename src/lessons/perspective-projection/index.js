/**
 * @module Perspective Projection
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Perspective Projection
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-perspective-projection.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import { Device, Utils, PerspectiveCamera } from "#/index";
import createVertices from "../orthographic-projection/F";
import Perspective from "./Perspective.wgsl";
import { mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.RenderPipeline(
            canvas, "Perspective Projection", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const settings =
    {
        scale: [1, 1, 1],
        fieldOfView: 100,
        translation: [-65, 0, -120],

        rotation: [
            Utils.DegreesToRadians(220),
            Utils.DegreesToRadians(25),
            Utils.DegreesToRadians(325)
        ]
    };

    const radToDegOptions =
    {
        min: -360,
        max: 360,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const gui = new GUI().onChange(render);
    const Camera = new PerspectiveCamera(settings.fieldOfView, 1, 2000);

    gui.add(settings, "fieldOfView", { min: 1, max: 179 }).name("Field of View");

    gui.add(settings.translation, "0", -1000, 1000).name("translation.x");
    gui.add(settings.translation, "1", -1000, 1000).name("translation.y");
    gui.add(settings.translation, "2", -1400, -100).name("translation.z");

    gui.add(settings.rotation, "0", radToDegOptions).name("rotation.x");
    gui.add(settings.rotation, "1", radToDegOptions).name("rotation.y");
    gui.add(settings.rotation, "2", radToDegOptions).name("rotation.z");

    const { vertexData, vertices } = createVertices();
    const module = Renderer.CreateShaderModule(Perspective);

    const { layout, buffer: vertexBuffer } = Renderer.CreateVertexBuffer([
        { name: "position", format: "float32x3" },
        { name: "color", format: "unorm8x4" }
    ], vertices);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, void 0, layout),
        depthStencil: Renderer.CreateDepthStencilState(),
        fragment: Renderer.CreateFragmentState(module),
        primitive: { cullMode: "front" }
    });

    const { matrix, buffer } =
        Renderer.CreateUniformBuffer("matrix");

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        void 0,
        Renderer.CreateDepthAttachment()
    );

    Renderer.SetBindGroups(
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries(
                { buffer }
            )
        )
    );

    Renderer.WriteBuffer(vertexBuffer, vertexData);
    Renderer.SetVertexBuffers(vertexBuffer);

    function render()
    {
        Camera.FieldOfView = settings.fieldOfView;
        mat4.copy(Camera.Projection, matrix);

        mat4.translate(matrix, settings.translation, matrix);

        mat4.rotateX(matrix, settings.rotation[0], matrix);
        mat4.rotateY(matrix, settings.rotation[1], matrix);
        mat4.rotateZ(matrix, settings.rotation[2], matrix);

        mat4.scale(matrix, settings.scale, matrix);

        Renderer.WriteBuffer(buffer, matrix);
        Renderer.Render(vertices);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = inlineSize / blockSize;
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
