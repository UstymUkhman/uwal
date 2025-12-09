/**
 * @module 2D Directional Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is developed using the version listed below. Please note
 * that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import {
    Scene,
    Shape,
    Device,
    Camera2D,
    MathUtils,
    Geometries
} from "#/index";

import FShader from "./F.wgsl";
import createVertices from "../matrix-math/F.js";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "2D Directional Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new Scene();
    const Camera = new Camera2D();

    const RenderPipeline = new Renderer.Pipeline();
    const { vertexData, indexData } = createVertices();
    const module = RenderPipeline.CreateShaderModule(FShader);

    const { uniforms, buffer } = RenderPipeline.CreateUniformBuffer("uniforms");
    const geometry = new Geometries.Shape({ radius: 75, indexFormat: "uint32" });

    geometry.IndexData = indexData; geometry.VertexData = vertexData;

    await Renderer.AddPipeline(RenderPipeline, {
        fragment: RenderPipeline.CreateFragmentState(module),
        vertex: RenderPipeline.CreateVertexState(module,
            geometry.GetPositionBufferLayout(RenderPipeline)
        )
    });

    const shape = new Shape(geometry, null);
    shape.SetRenderPipeline(RenderPipeline, buffer);

    const light = MathUtils.Vec3.create(0, 0, -1);
    MathUtils.Vec3.normalize(light, uniforms.light);

    MathUtils.Mat4.identity(uniforms.normal);
    uniforms.color.set([0.5, 1, 0.5, 1]);

    shape.Position = [300, 200];
    shape.Origin = [50, 75];
    scene.Add(shape);

    function render()
    {
        RenderPipeline.WriteBuffer(buffer, uniforms.normal.buffer);
        Renderer.Render(scene);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.Size = Renderer.CanvasSize;
            scene.AddCamera(Camera);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
