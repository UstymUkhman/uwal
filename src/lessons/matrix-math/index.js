/**
 * @module Matrix Math
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Math
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-math.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import { Device, Camera2D, MathUtils } from "#/index";
import Projection from "./Projection.wgsl";
import createVertices from "./F.js";

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
        Renderer = new (await Device.Renderer(canvas, "Matrix Math", { alphaMode: "premultiplied" }));
    }
    catch (error)
    {
        alert(error);
    }

    const objectUniforms = [];
    const camera = new Camera2D();
    const gui = new GUI().onChange(render);
    const RenderPipeline = new Renderer.Pipeline();

    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const settings = { translation: [150, 100], rotation: MathUtils.DegreesToRadians(30), scale: [1, 1], objects: 1 };

    gui.add(settings.translation, "0", 0, 1000).name("translation.x");
    gui.add(settings.translation, "1", 0, 1000).name("translation.y");
    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings.scale, "0", -5, 5).name("scale.x");
    gui.add(settings.scale, "1", -5, 5).name("scale.y");
    gui.add(settings, "objects", 1, 5, 1).name("objects");

    const { vertexData, indexData, vertices } = createVertices();
    const module = RenderPipeline.CreateShaderModule(Projection);

    const { buffer: vertexBuffer, layout } =
        RenderPipeline.CreateVertexBuffer("position", vertexData.length / 2);

    const indexBuffer = RenderPipeline.CreateIndexBuffer(indexData);

    await Renderer.AddPipeline(RenderPipeline, {
        vertex: RenderPipeline.CreateVertexState(module, layout),
        fragment: RenderPipeline.CreateFragmentState(module)
    });

    RenderPipeline.WriteBuffer(vertexBuffer, vertexData);
    RenderPipeline.WriteBuffer(indexBuffer, indexData);

    RenderPipeline.SetVertexBuffers(vertexBuffer);
    RenderPipeline.SetIndexBuffer(indexBuffer);
    RenderPipeline.SetDrawParams(vertices);

    for (let o = 0; o < 5; ++o)
    {
        const Uniforms = RenderPipeline.CreateUniformBuffer("uniforms");
        Uniforms.uniforms.color.set([MathUtils.Random(), MathUtils.Random(), MathUtils.Random(), 1]);

        RenderPipeline.WriteBuffer(Uniforms.buffer, Uniforms.uniforms.color);
        RenderPipeline.AddBindGroupFromResources(Uniforms.buffer);
        objectUniforms.push(Uniforms);
    }

    function render()
    {
        const translationMatrix = MathUtils.Mat3.translation(settings.translation);
        const rotationMatrix = MathUtils.Mat3.rotation(settings.rotation);
        const scaleMatrix = MathUtils.Mat3.scaling(settings.scale);

        // Set the origin of the "F" to its center:
        const originMatrix = MathUtils.Mat3.translation([-50, -75]);

        let matrix = MathUtils.Mat3.identity();

        for (let o = 0; o < settings.objects; ++o)
        {
            const { uniforms, buffer } = objectUniforms[o];
            /* MathUtils.Mat3.copy(camera.ProjectionMatrix, uniforms.matrix);

            MathUtils.Mat3.translate(uniforms.matrix, settings.translation, uniforms.matrix);
            MathUtils.Mat3.rotate(uniforms.matrix, settings.rotation, uniforms.matrix);
            MathUtils.Mat3.scale(uniforms.matrix, settings.scale, uniforms.matrix); */

            matrix = MathUtils.Mat3.multiply(matrix, translationMatrix);
            matrix = MathUtils.Mat3.multiply(matrix, rotationMatrix);
            matrix = MathUtils.Mat3.multiply(matrix, scaleMatrix);
            matrix = MathUtils.Mat3.multiply(matrix, originMatrix);

            uniforms.matrix.set(matrix);

            RenderPipeline.WriteBuffer(buffer, uniforms.matrix.buffer);
            RenderPipeline.SetActiveBindGroups(o);
            Renderer.Render(false);
        }

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            camera.UpdateProjectionMatrix();
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
