/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import * as UWAL from "#/index";
import Texture from "./Texture.wgsl";
import Logo from "/assets/images/logo.jpg";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;

const Camera = new UWAL.Camera2D();
let Storage, texture;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Textures / Instancing"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new UWAL.Scene();
    const radius = 128, textures = 256;
    const Pipeline = new Renderer.Pipeline();
    const Geometry = new UWAL.Geometries.Shape({ radius });

    let spawnTimeout, textureIndex, lastTexture = textures - 1;
    let textureUpdate = 512, lastRender = performance.now() - textureUpdate;
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new UWAL.Color(0x19334c)));
    const module = Pipeline.CreateShaderModule([UWAL.Shaders.ShapeVertexInstance, Texture]);

    await Renderer.AddPipeline(Pipeline, {
        fragment: Pipeline.CreateFragmentState(module),
        vertex: Pipeline.CreateVertexState(module, void 0, [
            Geometry.GetPositionBufferLayout(Pipeline),
            Geometry.GetInstanceBufferLayout(Pipeline)
        ])
    });

    function clean()
    {
        cancelAnimationFrame(raf);
        scene.Children.splice(1)[0]?.Destroy();
        spawnTimeout = clearTimeout(spawnTimeout);
        lastRender = performance.now() - (textureUpdate = 512);
    }

    async function start()
    {
        setTranslationData(createShape(await createTexture()));
        raf = requestAnimationFrame(render);

        spawnTimeout = setTimeout(() =>
            textureUpdate = ~(textureIndex = -1)
        , textureUpdate * 3);
    }

    async function createTexture()
    {
        Storage = Pipeline.CreateStorageBuffer("visible", textures);
        const Texture = new (await UWAL.TextureUtils());

        texture = await Texture.CopyImageToTexture(
            await Texture.CreateImageBitmap(Logo),
            { mipmaps: false }
        );

        return Texture.CreateSampler();
    }

    function createShape(sampler)
    {
        const shape = new UWAL.Shape(Geometry);

        shape.SetRenderPipeline(Pipeline, [
                Camera.SetRenderPipeline(Pipeline),
                sampler, texture,
                Renderer.ResolutionBuffer,
                Storage.buffer
            ],
            [UWAL.BINDINGS.CAMERA_MATRIX, 0, 1, 2, 3]
        );

        scene.Add(shape);
        shape.UpdateWorldMatrix();
        shape.AddInstanceBuffer(textures);

        return shape;
    }

    function setTranslationData(shape)
    {
        const matrix = UWAL.MathUtils.Mat3.copy(shape.WorldMatrix);
        const translation = UWAL.MathUtils.Vec2.create();
        const [x, y] = Renderer.CanvasSize;

        for (let t = textures; t--; )
        {
            translation.set([UWAL.MathUtils.Random(0, x), UWAL.MathUtils.Random(0, y)]);
            UWAL.MathUtils.Mat3.translate(matrix, translation, matrix);
            UWAL.MathUtils.Mat3.rotate(matrix, UWAL.MathUtils.Random(0, UWAL.MathUtils.HPI), matrix);

            shape.SetInstanceMatrix(matrix, t, false);
            UWAL.MathUtils.Mat3.copy(shape.WorldMatrix, matrix);
        }

        shape.UpdateInstanceBuffer();
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        if (time - lastRender < textureUpdate) return;

        textureUpdate
            ? Storage.visible.fill(0) && (textureIndex = UWAL.MathUtils.RandomInt(0, lastTexture))
            : ++textureIndex === lastTexture && cancelAnimationFrame(raf);

        lastRender = time;
        Storage.visible[textureIndex] = 1;

        Pipeline.WriteBuffer(Storage.buffer, Storage.visible);
        Renderer.Render(scene);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            !scene.MainCamera && scene.AddMainCamera(Camera);
            Renderer.SetCanvasSize(width, blockSize);
            Camera.Size = Renderer.CanvasSize;
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Camera.Destroy();
    UWAL.Device.Destroy(
        Storage.buffer,
        texture
    );
}
