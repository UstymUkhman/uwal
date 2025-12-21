/**
 * @module 2D Directional Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is developed using the version listed below. Please note
 * that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import {
    Color,
    Scene,
    Shape,
    Device,
    Shaders,
    Camera2D,
    Materials,
    MathUtils,
    Geometries,
    DirectionalLight
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

    const module = RenderPipeline.CreateShaderModule([Shaders.Light, Shaders.Shape, FShader]);
    const { Light, buffer } = RenderPipeline.CreateUniformBuffer("Light");

    const geometry = new Geometries.Shape({ radius: 75, indexFormat: "uint32" });
    geometry.IndexData = indexData; geometry.VertexData = vertexData;

    await Renderer.AddPipeline(RenderPipeline, {
        fragment: RenderPipeline.CreateFragmentState(
                module, void 0, void 0, "shapeFragment"
        ),

        vertex: RenderPipeline.CreateVertexState(module,
            geometry.GetPositionBufferLayout(RenderPipeline),
            void 0, "shapeVertex"
        )
    });

    const shape = new Shape(geometry, new Materials.Color(0x33ff33));
    shape.SetRenderPipeline(RenderPipeline, buffer);

    Light.direction.set(new DirectionalLight().Direction);
    RenderPipeline.WriteBuffer(buffer, Light.direction.buffer);

    shape.Position = [300, 200];
    shape.Origin = [50, 75];
    scene.Add(shape);

    function render()
    {
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
