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

import Instance from "./Instance.wgsl";
import * as UWAL from "#/index";

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

    let lastTime = 0;
    const INSTANCES = 200;
    const Scene = new UWAL.Scene();

    const Color = new UWAL.Color(0x4c4c4c);
    const Pipeline = new Renderer.Pipeline();
    const Camera = new UWAL.Camera2D(Renderer);

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(Color));
    const module = Pipeline.CreateShaderModule([UWAL.Shaders.ShapeVertexInstance, Instance]);
    const Geometry = new UWAL.Geometries.Shape({ segments: 24, radius: 0.5, innerRadius: 0.25 });

    const addScalar = (v, s, dst = UWAL.MathUtils.Vec2.create()) => UWAL.MathUtils.Vec2.add(v, [s, s], dst);
    const subScalar = (v, s, dst = UWAL.MathUtils.Vec2.create()) => UWAL.MathUtils.Vec2.sub(v, [s, s], dst);

    const euclideanModulo = (a, b, dst = UWAL.MathUtils.Vec2.create()) => UWAL.MathUtils.Vec2.set(
        UWAL.MathUtils.EuclideanModulo(a[0], b[0]),
        UWAL.MathUtils.EuclideanModulo(a[1], b[1]),
        dst
    );

    await Renderer.AddPipeline(Pipeline, {
        fragment: Pipeline.CreateFragmentState(module),
        vertex: Pipeline.CreateVertexState(module, "vertexShape", [
            Geometry.GetPositionBufferLayout(Pipeline),
            Geometry.GetInstanceBufferLayout(Pipeline)
        ])
    });

    const colorsBuffer = Pipeline.SetBufferData(Pipeline.CreateUniformBuffer("colors"), [0.1, 1]);
    const { color, buffer: colorBuffer } = Pipeline.CreateStorageBuffer("color", INSTANCES * 4);
    const cameraBuffer = Camera.SetRenderPipeline(Pipeline);

    const Shape = new UWAL.Shape(Geometry);
    Scene.AddMainCamera(Camera);
    Scene.Add(Shape);

    Shape.SetRenderPipeline(
        Pipeline,
        [cameraBuffer, colorBuffer, colorsBuffer],
        [UWAL.BINDINGS.CAMERA_MATRIX, 0, 1]
    );

    Shape.AddInstanceBuffer(INSTANCES, "vertexShape");
    const translation = UWAL.MathUtils.Vec2.create();
    const velocity = new Float16Array(INSTANCES * 2);
    const matrix = UWAL.MathUtils.Mat3.identity();

    function initializeObjects()
    {
        const { Mat3, Random } = UWAL.MathUtils;
        const [width, height] = Renderer.CanvasSize;

        for (let i = INSTANCES; i--; )
        {
            let s = Math.min(width, height) * 0.1 | 0;
            s = UWAL.MathUtils.RandomInt(s, s * 2.5);
            const x = Random(0.2), y = Random(0.2);

            translation.set([Random(width), Random(height)]);
            Mat3.translate(matrix, translation, matrix);
            Mat3.scale(matrix, [s, s], matrix);

            Shape.SetInstanceMatrix(matrix, i, false);
            velocity.set([x - 0.1, y - 0.1], i * 2);
            color.set(Color.Random().RGBA, i * 4);
            Mat3.copy(Shape.WorldMatrix, matrix);
        }

        Pipeline.WriteBuffer(colorBuffer, color);
    }

    function updateTransformMatrix(delta)
    {
        const { Mat3, Vec2 } = UWAL.MathUtils;
        const speed = Vec2.create(), size = Vec2.create();

        for (let i = INSTANCES; i--; )
        {
            const [scale] = Shape.GetInstanceMatrix(i, matrix);
            const offset = scale / 2, v = i * 2;

            Vec2.copy(velocity.slice(v, v + 2), speed);
            Vec2.copy(Renderer.CanvasSize, size);

            Vec2.scale(speed, delta, speed);
            addScalar(speed, offset, speed);

            Mat3.getTranslation(matrix, translation);
            Vec2.add(translation, speed, translation);

            addScalar(size, scale, size);
            euclideanModulo(translation, size, translation);
            subScalar(translation, offset, translation);

            Mat3.setTranslation(matrix, translation, matrix);
            Shape.SetInstanceMatrix(matrix, i, false);
        }

        Shape.UpdateInstanceBuffer();
    }

    function render(time)
    {
        const delta = time - lastTime;
        requestAnimationFrame(render);
        updateTransformMatrix(delta);
        Renderer.Render(Scene);
        lastTime = time;
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
        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
