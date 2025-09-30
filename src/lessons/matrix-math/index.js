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

import {
    Color,
    Shape,
    Device,
    Shaders,
    Camera2D,
    MathUtils,
    Materials,
    Geometries
} from "#/index";

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

    const camera = new Camera2D();
    const gui = new GUI().onChange(render);
    const RenderPipeline = new Renderer.Pipeline();

    const { vertexData, indexData } = createVertices();
    const module = RenderPipeline.CreateShaderModule(Shaders.Shape);
    const geometry = new Geometries.Shape({ radius: 150, indexFormat: "uint32" });

    const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };
    const settings = { translation: [150, 100], rotation: MathUtils.DegreesToRadians(30), scale: [1, 1], objects: 1 };

    gui.add(settings.translation, "0", 0, 1000).name("translation.x");
    gui.add(settings.translation, "1", 0, 1000).name("translation.y");
    gui.add(settings, "rotation", radToDegOptions);
    gui.add(settings.scale, "0", -5, 5).name("scale.x");
    gui.add(settings.scale, "1", -5, 5).name("scale.y");
    gui.add(settings, "objects", 1, 5, 1).name("objects");

    await Renderer.AddPipeline(RenderPipeline, {
        fragment: RenderPipeline.CreateFragmentState(module),
        vertex: RenderPipeline.CreateVertexState(module,
            geometry.GetPositionBufferLayout(RenderPipeline)
        )
    });

    const color = new Color();
    geometry.IndexData = indexData;
    geometry.VertexData = vertexData;

    const shapes = Array.from({ length: 5 }).map(() => {
        const shape = new Shape(geometry, new Materials.Shape(color.Random()));
        shape.SetRenderPipeline(RenderPipeline);
        return shape;
    });

    function render()
    {
        const origin = [-50, -75];
        const matrix = MathUtils.Mat3.copy(camera.ProjectionMatrix);

        for (let o = 0; o < settings.objects; ++o)
        {
            const projection = shapes[o].ProjectionMatrix;
            MathUtils.Mat3.copy(matrix, projection);

            MathUtils.Mat3.translate(projection, settings.translation, projection);
            MathUtils.Mat3.rotate(projection, settings.rotation, projection);
            MathUtils.Mat3.scale(projection, settings.scale, projection);
            MathUtils.Mat3.translate(projection, origin, projection);

            RenderPipeline.WriteBuffer(shapes[o].ProjectionBuffer, projection);
            MathUtils.Mat3.copy(projection, matrix);

            // shapes[o].Position = settings.translation;
            // shapes[o].Rotation = settings.rotation;
            // shapes[o].Scale = settings.scale;

            // shapes[o].UpdateProjectionMatrix();
            shapes[o].SetPipelineData();
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
