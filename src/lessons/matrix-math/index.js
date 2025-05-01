/**
 * @module Matrix Math
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Math
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-math.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.10
 * @license MIT
 */

import createVertices from "../translation/F.js";
import { UWAL, Shaders, Utils } from "#/index";
import MatrixMath from "./MatrixMath.wgsl";
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
        Renderer = new (await UWAL.RenderPipeline(
            canvas, "MatrixMath", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const objects = 1, objectUniforms = [], gui = new GUI().onChange(render);
    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const settings = { translation: [150, 100], rotation: Utils.DegreesToRadians(30), scale: [1, 1] };

    gui.add(settings.translation, "0", 0, 1000).name("translation.x");
    gui.add(settings.translation, "1", 0, 1000).name("translation.y");
    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings.scale, "0", -5, 5).name("scale.x");
    gui.add(settings.scale, "1", -5, 5).name("scale.y");

    const module = Renderer.CreateShaderModule([Shaders.Resolution, MatrixMath]);
    const { vertexData, indexData, vertices } = createVertices();
    const indexBuffer = Renderer.CreateIndexBuffer(indexData);

    const { buffer: vertexBuffer, layout } = Renderer.CreateVertexBuffer(
        "position", vertexData.length / 2
    );

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, void 0, layout),
        fragment: Renderer.CreateFragmentState(module)
    });

    for (let o = 0; o < objects; ++o)
    {
        const Uniforms = Renderer.CreateUniformBuffer("uniforms");

        Uniforms.uniforms.color.set([Math.random(), Math.random(), Math.random(), 1]);
        Renderer.WriteBuffer(Uniforms.buffer, Uniforms.uniforms.color);

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    { buffer: Renderer.ResolutionBuffer },
                    { buffer: Uniforms.buffer }
                ])
            )
        );

        objectUniforms.push(Uniforms);
    }

    Renderer.WriteBuffer(vertexBuffer, vertexData);
    Renderer.WriteBuffer(indexBuffer, indexData);

    Renderer.SetVertexBuffers(vertexBuffer);
    Renderer.SetIndexBuffer(indexBuffer);

    function render()
    {
        const translationMatrix = mat3.translation(settings.translation);
        const rotationMatrix = mat3.rotation(settings.rotation);
        const scaleMatrix = mat3.scaling(settings.scale);

        // Set the origin of the "F" to its center:
        const originMatrix = mat3.translation([-50, -75]);

        let matrix = mat3.identity();

        for (let o = 0; o < objects; ++o)
        {
            const { uniforms, buffer } = objectUniforms[o];

            matrix = mat3.multiply(matrix, translationMatrix);
            matrix = mat3.multiply(matrix, rotationMatrix);
            matrix = mat3.multiply(matrix, scaleMatrix);
            matrix = mat3.multiply(matrix, originMatrix);

            uniforms.matrix.set(matrix);
            Renderer.WriteBuffer(buffer, uniforms.matrix.buffer);

            Renderer.SetActiveBindGroups(o);
            Renderer.Render(vertices, false);
        }

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
