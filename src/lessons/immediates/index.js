/**
 * @module Immediates
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Immediates
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-immediates.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Immediates from "./Immediates.wgsl";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Immediates"));
    }
    catch (error)
    {
        alert(error);
    }

    const Pipeline = new Renderer.Pipeline();
    const Scene = new UWAL.Scene(), MODELS = 200;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const Camera = new UWAL.OrthographicCamera(-1, 1, 1, aspect, -1, -aspect);
    const module = Pipeline.CreateShaderModule([UWAL.Shaders.ShapeVertex, Immediates]);

    await Renderer.AddPipeline(Pipeline,
    {
        fragment: Pipeline.CreateFragmentState(module),
        vertex: Pipeline.CreateVertexState(module, "immediatesVertex", [
            Pipeline.CreateVertexBufferLayout({ name: "position", format: "float32x2" })
        ])
    });

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new UWAL.Color(0x4c4c4c)));
    const { models, buffer: modelsBuffer } = Pipeline.CreateStorageBuffer("models", MODELS * 16);

    const materialsBuffer = Pipeline.WriteBufferData(Pipeline.CreateStorageBuffer("materials", 4 * 6),
    [
        1.0, 0.5, 0.5, 1.0, // Red
        0.5, 1.0, 0.5, 1.0, // Green
        0.5, 0.5, 1.0, 1.0, // Blue
        1.0, 1.0, 0.5, 1.0, // Yellow
        1.0, 0.5, 1.0, 1.0, // Magenta
        0.5, 1.0, 1.0, 1.0, // Cyan
    ]);

    Scene.AddMainCamera(Camera);
    const CameraMatrixBuffer = Camera.SetRenderPipeline(Pipeline);

    const Geometries = Array.from({ length: 3 }).map((_, g) =>
    {
        const vertices = [], triangles = 100;
        const theta = triangles / UWAL.MathUtils.TAU;

        // Triangle:
        if (!g)
            vertices.push(
                 0.0,  0.5,
                -0.5, -0.5,
                 0.5, -0.5
            );

        // Circle:
        else if (g === 1)
            for (let t = 0; t < triangles; ++t)
            {
                const angle0 = (t + 0) / theta;
                const angle1 = (t + 1) / theta;

                const cos0 = Math.cos(angle0) * 0.5;
                const cos1 = Math.cos(angle1) * 0.5;

                const sin0 = Math.sin(angle0) * 0.5;
                const sin1 = Math.sin(angle1) * 0.5;

                vertices.push(cos0, sin0);
                vertices.push(cos1, sin1);
                vertices.push( 0.0,  0.0);
            }

        // Square:
        else
            vertices.push(
                -0.5, -0.5,
                 0.5, -0.5,
                -0.5,  0.5,
                -0.5,  0.5,
                 0.5, -0.5,
                 0.5,  0.5
            );

        // Use radius to store the amout of vertices:
        const Geometry = new UWAL.Geometries.Shape({ radius: vertices.length / 2 });
        Geometry.VertexData = new Float32Array(vertices);
        return Geometry;
    });

    for (let m = 0, materials = materialsBuffer.size / 64 - 1; m < MODELS; ++m)
    {
        const geometryIndex = UWAL.MathUtils.RandomInt(0, Geometries.length - 1);
        const materialIndex = UWAL.MathUtils.RandomInt(0, materials);

        const Geometry = Geometries[geometryIndex];
        const Shape = new UWAL.Shape(Geometry);

        Shape.SetRenderPipeline(
            Pipeline,
            [modelsBuffer, materialsBuffer, CameraMatrixBuffer],
            [0, 1, UWAL.BINDINGS.CAMERA_MATRIX]
        );

        Shape.Immediates = new Uint32Array([m, materialIndex ]);
        Geometry.SetDrawParams(Geometry.Radius);
        Geometry.IndexBuffer = void 0;
        Scene.Add(Shape);

        const { Mat4, Random: rnd } = UWAL.MathUtils;
        const mat = Mat4.translation([rnd(-1, 1), rnd(-1, 1), 0]);

        Mat4.rotateZ(mat, rnd(0, UWAL.MathUtils.TAU), mat);
        Mat4.scale(mat, [rnd(0.1, 0.2), rnd(0.1, 0.2), 1], mat);
        Pipeline.WriteBuffer(modelsBuffer, mat, m * 64);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Camera.Left = -(Camera.Right = inlineSize / blockSize);
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.UpdateViewProjectionMatrix();
        }

        Renderer.Render(Scene);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
