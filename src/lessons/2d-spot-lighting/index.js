/**
 * @module 2D Spot Lighting
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
        Renderer = new (await Device.Renderer(canvas, "2D Spot Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    const gui = new GUI();
    gui.onChange(render);

    const scene = new Scene();
    const Camera = new Camera2D();

    const settings = {
        shininess: 60,
        innerLimit: MathUtils.DegreesToRadians(10),
        outerLimit: MathUtils.DegreesToRadians(30),
        aimOffsetX: 45,
        aimOffsetY: 65
    };

    const limitOptions = {
        min: 0,
        max: 90,
        minRange: 1,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const RenderPipeline = new Renderer.Pipeline();
    const { vertexData, indexData } = createVertices();
    const module = RenderPipeline.CreateShaderModule(FShader);

    const { uniforms, buffer } = RenderPipeline.CreateUniformBuffer("uniforms");
    const geometry = new Geometries.Shape({ radius: 75, indexFormat: "uint32" });

    GUI.makeMinMaxPair(gui, settings, "innerLimit", "outerLimit", limitOptions);
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
    gui.add(settings, "aimOffsetX", -50, 100);
    gui.add(settings, "aimOffsetY", -50, 150);

    MathUtils.Mat4.identity(uniforms.normal);
    MathUtils.Mat4.identity(uniforms.world);

    uniforms.color.set([0.5, 1, 0.5, 1]);
    uniforms.light.set([60, 65, 70]);

    shape.Position = [300, 200];
    shape.Origin = [50, 75];
    scene.Add(shape);

    function render()
    {
        uniforms.intensity[0] = settings.shininess;
        uniforms.camera.set([...Camera.Position, 200]);

        uniforms.limit[0] = Math.cos(settings.innerLimit);
        uniforms.limit[1] = Math.cos(settings.outerLimit);

        // Point the spot light at the camera target (FMesh) + settings offsets:
        const target = [settings.aimOffsetX, settings.aimOffsetY, 0];

        // Get the Z axis from the target matrix and negate it because `lookAt` looks down the -Z axis:
        uniforms.direction.set(MathUtils.Mat4.aim(uniforms.light, target, [0, 1, 0]).slice(8, 11));

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
