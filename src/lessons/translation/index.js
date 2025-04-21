/**
 * @module Translation
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Translation
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-translation.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.10
 * @license MIT
 */

import Translation from "./Translation.wgsl";
import { UWAL, Shaders } from "#/index";
import createVertices from "./F.js"

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    canvas.style.backgroundPosition = "-1.5px -1.5px, -1.5px -1.5px, -1px -1px, -1px -1px";
    canvas.style.backgroundSize     = "100px 100px, 100px 100px, 10px 10px, 10px 10px";
    canvas.style.backgroundColor    = "#000000";
    canvas.style.backgroundImage    = `
        linear-gradient(       #666 1.5px, transparent 1.5px),
        linear-gradient(90deg, #666 1.5px, transparent 1.5px),
        linear-gradient(       #333 1px,   transparent 1px),
        linear-gradient(90deg, #333 1px,   transparent 1px)
    `;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(
            canvas, "Translation", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const gui = new GUI().onChange(render);
    const settings = { translation: [0, 0] };

    gui.add(settings.translation, '0', 0, 1000).name('translation.x');
    gui.add(settings.translation, '1', 0, 1000).name('translation.y');

    const module = Renderer.CreateShaderModule([Shaders.Resolution, Translation]);
    const { uniforms, buffer: uniformsBuffer } = Renderer.CreateUniformBuffer("uniforms");

    uniforms.color.set([Math.random(), Math.random(), Math.random(), 1.0]);
    const { vertexData, indexData, vertices } = createVertices();
    const indexBuffer = Renderer.CreateIndexBuffer(indexData);

    const { buffer: vertexBuffer, layout } = Renderer.CreateVertexBuffer(
        "position", vertexData.length / 2
    );

    Renderer.WriteBuffer(uniformsBuffer, uniforms.color);
    Renderer.WriteBuffer(vertexBuffer, vertexData);
    Renderer.WriteBuffer(indexBuffer, indexData);

    Renderer.SetVertexBuffers(vertexBuffer);
    Renderer.SetIndexBuffer(indexBuffer);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, void 0, layout),
        fragment: Renderer.CreateFragmentState(module)
    });

    Renderer.SetBindGroups(
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                { buffer: Renderer.ResolutionBuffer },
                { buffer: uniformsBuffer }
            ])
        )
    );

    function render()
    {
        uniforms.translation.set(settings.translation);
        // Write into the `uniformsBuffer` skipping 4 color values:
        Renderer.WriteBuffer(uniformsBuffer, uniforms.translation, 16);
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
