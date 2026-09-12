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
import Compute from "./Compute.wgsl";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    /** @type {Computation} */ let Computation;

    try
    {
        UWAL.Device.SetRequiredFeatures("bgra8unorm-storage");
        Computation = new (await UWAL.Computation("Basic CRT Effect"));
        Renderer = new (await UWAL.Renderer(canvas, "Basic CRT Effect", { usage: GPUTextureUsage.STORAGE_BINDING }));
    }
    catch (error)
    {
        alert(error);
    }

    const settings =
    {
        effectAmount: 1,
        bandMultiplier: 1,
        cellBrightness: 1,
        cellSize: 0.5
    };

    const Scene = new UWAL.Scene();
    let lastTime = 0, gui = new GUI();
    const { Mat3, Vec2 } = UWAL.MathUtils;
    const Color = new UWAL.Color(0x4c4c4c);
    const INSTANCES = 200, WORKGROUP_DIMENSION = 16;

    gui.add(settings, "effectAmount", 0, 1);
    gui.add(settings, "bandMultiplier", 0.01, 2);
    gui.add(settings, "cellBrightness", 0, 2);
    gui.add(settings, "cellSize", 0, 1);

    const Camera = new UWAL.Camera2D(Renderer);
    const ImagePipeline = new Renderer.Pipeline();
    const Texture = new (await UWAL.TextureUtils());
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(Color));

    const addScalar = (v, s, dst = Vec2.create()) => Vec2.add(v, [s, s], dst);
    const subScalar = (v, s, dst = Vec2.create()) => Vec2.sub(v, [s, s], dst);
    const Geometry = new UWAL.Geometries.Shape({ segments: 24, radius: 0.5, innerRadius: 0.25 });
    const module = ImagePipeline.CreateShaderModule([UWAL.Shaders.ShapeVertexInstance, Instance]);

    const PostProcessPipeline = await Computation.CreatePipeline({
        constants: { WORKGROUP_DIMENSION: WORKGROUP_DIMENSION },
        shader: `@group(1) @binding(0) var OutputTexture: texture_storage_2d<${Texture.PreferredStorageFormat}, write>;
            ${Compute}`
    });

    const euclideanModulo = (a, b, dst = UWAL.MathUtils.Vec2.create()) => Vec2.set(
        UWAL.MathUtils.EuclideanModulo(a[0], b[0]),
        UWAL.MathUtils.EuclideanModulo(a[1], b[1]),
        dst
    );

    await Renderer.AddPipeline(ImagePipeline, {
        fragment: ImagePipeline.CreateFragmentState(module),
        vertex: ImagePipeline.CreateVertexState(module, "vertexShape", [
            Geometry.GetPositionBufferLayout(ImagePipeline),
            Geometry.GetInstanceBufferLayout(ImagePipeline)
        ])
    });

    const colorsBuffer = ImagePipeline.WriteBufferData(ImagePipeline.CreateUniformBuffer("colors"), [0.1, 1]);
    const { color, buffer: colorBuffer } = ImagePipeline.CreateStorageBuffer("color", INSTANCES * 4);
    const { effect, buffer: effectBuffer } = PostProcessPipeline.CreateUniformBuffer("effect");
    const cameraBuffer = Camera.SetRenderPipeline(ImagePipeline);

    const Shape = new UWAL.Shape(Geometry);
    Scene.AddMainCamera(Camera);
    Scene.Add(Shape);

    Shape.SetRenderPipeline(
        ImagePipeline,
        [cameraBuffer, colorBuffer, colorsBuffer],
        [UWAL.BINDINGS.CAMERA_MATRIX, 0, 1]
    );

    Shape.AddInstanceBuffer(INSTANCES, "vertexShape");
    const velocity = new Float16Array(INSTANCES * 2);
    const translation = Vec2.create();
    const matrix = Mat3.identity();

    function initializeObjects()
    {
        const { Random } = UWAL.MathUtils;
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

        ImagePipeline.WriteBuffer(colorBuffer, color);
    }

    function updateTransform(delta)
    {
        const size = Vec2.create();
        const speed = Vec2.create();

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
        effect.cellSize.set([settings.cellSize]);
        effect.amount.set([settings.effectAmount]);
        effect.multiplier.set([settings.bandMultiplier]);
        effect.cellBrightness.set([settings.cellBrightness]);

        // Write both into the `GPUBuffer` by passing the `ArrayBuffer`:
        PostProcessPipeline.WriteBuffer(effectBuffer, effect.amount.buffer);
        PostProcessPipeline.SetBindGroupFromResources(Renderer.CurrentTexture, 0, 1);

        updateTransform(time - lastTime);
        requestAnimationFrame(render);
        Renderer.Render(Scene);
        Computation.Compute();
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

        if (
            ImagePipeline.TextureView?.width  !== Renderer.CanvasSize[0] ||
            ImagePipeline.TextureView?.height !== Renderer.CanvasSize[1]
        ) {
            ImagePipeline.TextureView?.destroy();
            ImagePipeline.TextureView = Texture.CreateTexture({ size: Renderer.CanvasSize });
            Computation.Workgroups = Renderer.CanvasSize.map(size => size / WORKGROUP_DIMENSION);
            PostProcessPipeline.SetBindGroupFromResources([Texture.CreateSampler(), effectBuffer, ImagePipeline.TextureView]);
        }

        initializeObjects();
        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
