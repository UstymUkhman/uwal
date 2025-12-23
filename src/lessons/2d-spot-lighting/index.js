/**
 * @module 2D Spot Lighting
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
    SpotLight,
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
    GUI.makeMinMaxPair(gui, settings, "innerLimit", "outerLimit", limitOptions);
    const module = RenderPipeline.CreateShaderModule([Shaders.Light, Shaders.Camera, Shaders.Shape, FShader]);

    const { Camera: camera, buffer: cameraBuffer } = RenderPipeline.CreateUniformBuffer("Camera");
    const { Light, buffer: lightBuffer } = RenderPipeline.CreateUniformBuffer("Light");

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
    shape.SetRenderPipeline(RenderPipeline, [lightBuffer, cameraBuffer]);

    gui.add(settings, "shininess", { min: 1, max: 250 });
    gui.add(settings, "aimOffsetX", -50, 100);
    gui.add(settings, "aimOffsetY", -50, 150);

    const light = new SpotLight([60, 65, 70]);
    Light.position.set(light.Position);
    shape.Position = [300, 200];
    shape.Origin = [50, 75];
    Camera.PositionZ = 200;
    scene.Add(shape);

    function render()
    {
        camera.position.set(Camera.Position3D);
        Light.intensity[0] = light.Intensity = settings.shininess;

        const { innerLimit, outerLimit } = settings;
        light.Limit = [innerLimit, outerLimit];
        Light.limit.set(light.Limit);

        // Point the spot light at the camera target (FMesh) + settings offsets:
        Light.direction.set(light.LookAt([settings.aimOffsetX, settings.aimOffsetY, 0]));

        RenderPipeline.WriteBuffer(lightBuffer, Light.position.buffer);
        RenderPipeline.WriteBuffer(cameraBuffer, camera.position);
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
