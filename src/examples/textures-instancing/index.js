/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.3.1
 * @license MIT
 */

import {
    Scene,
    Color,
    Shape,
    Device,
    Shaders,
    Camera2D,
    MathUtils,
    Geometries
} from "#/index";

import Texture from "./Texture.wgsl";
import Logo from "/assets/images/logo.jpg";

let Storage, texture;
/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Textures / Instancing"));
    }
    catch (error)
    {
        alert(error);
    }

    const scene = new Scene();
    const Camera = new Camera2D();
    const radius = 128, textures = 256;
    const Pipeline = new Renderer.Pipeline();
    const Geometry = new Geometries.Shape({ radius });

    let spawnTimeout, textureIndex, lastTexture = textures - 1;
    let textureUpdate = 512, lastRender = performance.now() - textureUpdate;
    const module = Pipeline.CreateShaderModule([Shaders.ShapeVertexInstance, Texture]);
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new Color(0x19334c)));

    await Renderer.AddPipeline(Pipeline, {
        fragment: Pipeline.CreateFragmentState(module),
        vertex: Pipeline.CreateVertexState(module, [
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

        const Texture = new (await Device.Texture());

        texture = await Texture.CopyImageToTexture(
            await Texture.CreateImageBitmap(Logo),
            { mipmaps: false }
        );

        return {
            sampler: Texture.CreateSampler(),
            view: texture.createView()
        };
    }

    function createShape({ sampler, view })
    {
        const shape = new Shape(Geometry);

        shape.SetRenderPipeline(Pipeline, [
            sampler, view, Renderer.ResolutionBuffer, Storage.buffer
        ]);

        scene.Add(shape);
        shape.UpdateWorldMatrix();
        shape.AddInstanceBuffer(textures);

        return shape;
    }

    function setTranslationData(shape)
    {
        const matrix = MathUtils.Mat3.copy(shape.WorldMatrix);
        const translation = MathUtils.Vec2.create();
        const [x, y] = Renderer.CanvasSize;

        for (let t = textures; t--; )
        {
            translation.set([MathUtils.Random(0, x), MathUtils.Random(0, y)]);
            MathUtils.Mat3.translate(matrix, translation, matrix);
            MathUtils.Mat3.rotate(matrix, MathUtils.Random(0, MathUtils.HPI), matrix);

            shape.SetInstanceMatrix(matrix, t, false);
            MathUtils.Mat3.copy(shape.WorldMatrix, matrix);
        }

        shape.UpdateInstanceBuffer();
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        if (time - lastRender < textureUpdate) return;

        textureUpdate
            ? Storage.visible.fill(0) && (textureIndex = MathUtils.RandomInt(0, lastTexture))
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
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy([Storage.buffer], texture);
}
