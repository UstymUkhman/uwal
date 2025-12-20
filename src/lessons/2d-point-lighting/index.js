/**
 * @module 2D Point Lighting
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
    PointLight
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
    const settings = { shininess: 60 };

    const RenderPipeline = new Renderer.Pipeline();
    const { vertexData, indexData } = createVertices();

    const module = RenderPipeline.CreateShaderModule([Shaders.Light, Shaders.Shape, FShader]);
    const { uniforms, buffer } = RenderPipeline.CreateUniformBuffer("uniforms");
    const geometry = new Geometries.Shape({ radius: 75, indexFormat: "uint32" });
    geometry.IndexData = indexData; geometry.VertexData = vertexData;

    await Renderer.AddPipeline(RenderPipeline, {
        fragment: RenderPipeline.CreateFragmentState(module, void 0, void 0, "shapeFragment"),
        vertex: RenderPipeline.CreateVertexState(module,
            geometry.GetPositionBufferLayout(RenderPipeline),
            void 0, "shapeVertex"
        )
    });

    const shape = new Shape(geometry, new Materials.Color(0x33ff33));
    gui.add(settings, "shininess", { min: 1, max: 250 });
    shape.SetRenderPipeline(RenderPipeline, buffer);

    const light = new PointLight([60, 65, 70]);
    uniforms.light.set(light.Position);
    shape.Position = [300, 200];
    shape.Origin = [50, 75];
    scene.Add(shape);

    function render()
    {
        uniforms.camera.set([...Camera.Position, 200]);
        uniforms.intensity[0] = light.Intensity = settings.shininess;

        RenderPipeline.WriteBuffer(buffer, uniforms.camera.buffer);
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
