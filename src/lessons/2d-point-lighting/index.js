/**
 * @module 2D Point Lighting
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
        Renderer = new (await Device.Renderer(canvas, "2D Point Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const gui = new GUI();
    gui.onChange(render);

    const scene = new Scene();
    const Camera = new Camera2D();
    const settings = { shininess: 30 };

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
    gui.add(settings, "shininess", { min: 1, max: 250 });

    MathUtils.Mat4.identity(uniforms.normal);
    MathUtils.Mat4.identity(uniforms.world);

    uniforms.color.set([0.5, 1, 0.5, 1]);
    uniforms.light.set([65, 70, 75]);

    shape.Position = [300, 200];
    shape.Origin = [50, 75];
    scene.Add(shape);

    function render()
    {
        uniforms.intensity[0] = settings.shininess;
        uniforms.camera.set([...Camera.Position, 200]);

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
