/**
 * @module Basic CRT Effect
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Basic CRT Effect
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-post-processing.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import * as UWAL from "#/index";
import CRT from "./CRT.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Basic CRT Effect"));
    }
    catch (error)
    {
        alert(error);
    }

    const INSTANCES = 10_000;
    const Scene = new UWAL.Scene();
    const Color = new UWAL.Color(0x4c4c4c);
    const Pipeline = new Renderer.Pipeline();
    const Camera = new UWAL.Camera2D(Renderer);

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(Color));
    const module = Pipeline.CreateShaderModule([UWAL.Shaders.ShapeVertexInstance, CRT]);
    const Geometry = new UWAL.Geometries.Shape({ segments: 24, radius: 0.5, innerRadius: 0.25 });

    await Renderer.AddPipeline(Pipeline, {
        fragment: Pipeline.CreateFragmentState(module),
        vertex: Pipeline.CreateVertexState(module, "vertexShape", [
            Geometry.GetPositionBufferLayout(Pipeline),
            Geometry.GetInstanceBufferLayout(Pipeline)
        ])
    });

    const { color, buffer: colorBuffer } = Pipeline.CreateStorageBuffer("color", INSTANCES * 4);
    const { colors, buffer: colorsBuffer } = Pipeline.CreateUniformBuffer("colors");
    const cameraBuffer = Camera.SetRenderPipeline(Pipeline);

    const Shape = new UWAL.Shape(Geometry);
    Scene.AddMainCamera(Camera);
    Scene.Add(Shape);

    colors.set([0.1, 1]);

    Shape.SetRenderPipeline(
        Pipeline,
        [cameraBuffer, colorBuffer, colorsBuffer],
        [UWAL.BINDINGS.CAMERA_MATRIX, 0, 1]
    );

    Shape.AddInstanceBuffer(INSTANCES, "vertexShape");
    const translation = UWAL.MathUtils.Vec2.create();
    const matrix = UWAL.MathUtils.Mat3.identity();

    function initializeObjects()
    {
        const [width, height] = Renderer.CanvasSize;

        for (let i = INSTANCES; i--; )
        {
            let s = Math.min(width, height) * 0.1 | 0;
            s = UWAL.MathUtils.RandomInt(s, s * 2.5);

            UWAL.MathUtils.Mat3.scaling([s, s], matrix);
            Shape.SetInstanceMatrix(matrix, i, false);
            color.set(Color.Random().RGBA, i * 4);
        }

        Pipeline.WriteBuffer(colorsBuffer, colors);
        Pipeline.WriteBuffer(colorBuffer, color);
    }

    function updateTransformMatrix()
    {
        const [width, height] = Renderer.CanvasSize;
        const { Mat3, Random } = UWAL.MathUtils;

        for (let i = INSTANCES; i--; )
        {
            const [scale] = Shape.GetInstanceMatrix(i, matrix);
            const x = width / scale, y = height / scale;

            translation.set([Random(0, x), Random(0, y)]);
            Mat3.translate(matrix, translation, matrix);
            Shape.SetInstanceMatrix(matrix, i, false);
        }

        Shape.UpdateInstanceBuffer();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.Size = Renderer.CanvasSize;
        }

        initializeObjects();
        updateTransformMatrix();
        Renderer.Render(Scene);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
