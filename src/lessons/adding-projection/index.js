/**
 * @module Adding in Projection
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Math
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-math.html#adding-in-projection}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.11
 * @license MIT
 */

import createVertices from "../translation/F.js";
import Projection from "./Projection.wgsl";
import { Device, Utils } from "#/index";
import { mat3 } from "wgpu-matrix";

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
            canvas, "MatrixMath", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const gui = new GUI().onChange(render);
    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const settings = { translation: [150, 100], rotation: Utils.DegreesToRadians(30), scale: [1, 1] };

    gui.add(settings.translation, "0", 0, 1000).name("translation.x");
    gui.add(settings.translation, "1", 0, 1000).name("translation.y");
    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings.scale, "0", -5, 5).name("scale.x");
    gui.add(settings.scale, "1", -5, 5).name("scale.y");

    const { vertexData, indexData, vertices } = createVertices();
    const indexBuffer = Renderer.CreateIndexBuffer(indexData);
    const module = Renderer.CreateShaderModule(Projection);

    const { layout, buffer: vertexBuffer } = Renderer.CreateVertexBuffer(
        "position", vertexData.length / 2
    );

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, void 0, layout),
        fragment: Renderer.CreateFragmentState(module)
    });

    const { uniforms, buffer: uniformsBuffer } = Renderer.CreateUniformBuffer("uniforms");
    uniforms.color.set([Math.random(), Math.random(), Math.random(), 1]);
    Renderer.WriteBuffer(uniformsBuffer, uniforms.color);

    Renderer.SetBindGroups(
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries(
                { buffer: uniformsBuffer }
            )
        )
    );

    Renderer.WriteBuffer(vertexBuffer, vertexData);
    Renderer.WriteBuffer(indexBuffer, indexData);

    Renderer.SetVertexBuffers(vertexBuffer);
    Renderer.SetIndexBuffer(indexBuffer);

    function render()
    {
        mat3.copy(Renderer.Projection2D, uniforms.matrix);

        mat3.translate(uniforms.matrix, settings.translation, uniforms.matrix);
        mat3.rotate(uniforms.matrix, settings.rotation, uniforms.matrix);
        mat3.scale(uniforms.matrix, settings.scale, uniforms.matrix);

        Renderer.WriteBuffer(uniformsBuffer, uniforms.matrix.buffer);

        Renderer.Render(vertices);
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
