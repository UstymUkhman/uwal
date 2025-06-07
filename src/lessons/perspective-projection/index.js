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

import createVertices from "../orthographic-projection/F";
import Perspective from "./Perspective.wgsl";
import { Device, Utils } from "#/index";
import { mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    canvas.style.backgroundPosition = "-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px";
    canvas.style.backgroundSize     = "100px 100px, 100px 100px, 10px 10px, 10px 10px";
    canvas.style.backgroundColor    = "#000";
    canvas.style.backgroundImage    = `
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;

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
        fudge: 10,
        scale: [3, 3, 3],

        rotation: [
            Utils.DegreesToRadians(40),
            Utils.DegreesToRadians(25),
            Utils.DegreesToRadians(325)
        ],

        translation: [
            canvas.clientWidth  / 2 - 200,
            canvas.clientHeight / 2 - 100,
            -1000
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

    gui.add(settings.translation, "0",     0, 1000).name("translation.x");
    gui.add(settings.translation, "1",     0, 1000).name("translation.y");
    gui.add(settings.translation, "2", -1000, 1000).name("translation.z");

    gui.add(settings.rotation, "0", radToDegOptions).name("rotation.x");
    gui.add(settings.rotation, "1", radToDegOptions).name("rotation.y");
    gui.add(settings.rotation, "2", radToDegOptions).name("rotation.z");

    gui.add(settings.scale, "0", -5, 5).name("scale.x");
    gui.add(settings.scale, "1", -5, 5).name("scale.y");
    gui.add(settings.scale, "2", -5, 5).name("scale.z");

    gui.add(settings, "fudge", 0, 50).name("Fudge Factor");

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

    const { uniforms, buffer } =
        Renderer.CreateUniformBuffer("uniforms");

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
    Renderer.Depth = 400;

    function render()
    {
        mat4.copy(Renderer.OrthographicProjection, uniforms.matrix);

        mat4.translate(uniforms.matrix, settings.translation, uniforms.matrix);

        mat4.rotateX(uniforms.matrix, settings.rotation[0], uniforms.matrix);
        mat4.rotateY(uniforms.matrix, settings.rotation[1], uniforms.matrix);
        mat4.rotateZ(uniforms.matrix, settings.rotation[2], uniforms.matrix);

        mat4.scale(uniforms.matrix, settings.scale, uniforms.matrix);
        uniforms.fudge.set([settings.fudge])

        // Write `matrix` and `fudge` values by passing uniforms' `ArrayBufferView`:
        Renderer.WriteBuffer(buffer, uniforms.matrix.buffer);

        Renderer.Render(vertices);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Renderer.UpdateOrthographicProjection(1200, -1000);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
