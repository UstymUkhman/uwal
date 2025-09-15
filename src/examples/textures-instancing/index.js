/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import {
    Shape,
    Color,
    Device,
    Shaders,
    MathUtils,
    Geometries
} from "#/index";

import Texture from "./Texture.wgsl";
import Logo from "/assets/images/logo.jpg";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;
let texture, storageBuffer, translationBuffer;

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

    const radius = 128, textures = 256;
    const shape = new Shape(new Geometries.Shape());
    const TexturesPipeline = new Renderer.Pipeline();

    let storage, vertices, spawnTimeout, textureIndex, lastTexture,
        textureUpdate = 512, lastRender = performance.now() - textureUpdate;

    const module = TexturesPipeline.CreateShaderModule([Shaders.ShapeVertex, Texture]);
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new Color(0x19334c)));

    const { buffer: translationBuffer, layout: translationLayout } =
        TexturesPipeline.CreateVertexBuffer("translation", textures, "instance", "textureVertex");

    TexturesPipeline.WriteBuffer(translationBuffer, createTranslationData());

    await Renderer.AddPipeline(TexturesPipeline, {
        fragment: TexturesPipeline.CreateFragmentState(module),
        vertex: TexturesPipeline.CreateVertexState(module, [
            shape.GetPositionBufferLayout(TexturesPipeline),
            translationLayout
        ], void 0, "textureVertex")
    });

    function clean()
    {
        cancelAnimationFrame(raf);
        clearTimeout(spawnTimeout);
        lastRender = performance.now() - textureUpdate;
    }

    async function start()
    {
        createShape();
        shape.Destroy();
        createStorageBuffer();
        await createLogoTexture();
        requestAnimationFrame(render);

        spawnTimeout = setTimeout(() =>
            textureUpdate = ~(textureIndex = -1)
        , textureUpdate * 3);
    }

    function createShape()
    {
        const geometry = new Geometries.Shape({ radius });
        const [width, height] = Renderer.CanvasSize;
        const shape = new Shape(geometry);

        shape.SetRenderPipeline(TexturesPipeline, Renderer.ResolutionBuffer);
        TexturesPipeline.SetDrawParams(geometry.Vertices, textures);
        shape.AddVertexBuffers(translationBuffer);

        shape.Position = [width / 2, height / 2];
        shape.Rotation = Math.PI / 4;
        shape.Update();
    }

    function createStorageBuffer()
    {
        const Storage = TexturesPipeline.CreateStorageBuffer("visible", textures);
        TexturesPipeline.WriteBuffer(Storage.buffer, Storage.visible);
        lastTexture = (storage = Storage.visible).length - 1;
        storageBuffer = Storage.buffer;
    }

    function createTranslationData()
    {
        const translation = new Float32Array(textures * 2);
        const x = 1 - Math.sqrt(2) * radius / canvas.offsetWidth;
        const y = 1 - Math.sqrt(2) * radius / canvas.offsetHeight;

        for (let t = textures; t--; )
            translation.set([MathUtils.Random(-x, x), MathUtils.Random(-y, y)], t * 2);

        return translation;
    }

    async function createLogoTexture()
    {
        const Texture = new (await Device.Texture());

        texture = await Texture.CopyImageToTexture(
            await Texture.CreateImageBitmap(Logo),
            { flipY: true, create: { mipmaps: false } }
        );

        TexturesPipeline.AddBindGroupFromResources([
            Texture.CreateSampler(),
            texture.createView(),
            storageBuffer
        ], 0, 1);
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        if (time - lastRender < textureUpdate) return;

        textureUpdate
            ? storage.fill(0) && (textureIndex = MathUtils.RandomInt(0, lastTexture))
            : ++textureIndex === lastTexture && cancelAnimationFrame(raf);

        lastRender = time;
        storage[textureIndex] = 1;

        TexturesPipeline.WriteBuffer(storageBuffer, storage);
        Renderer.Render();
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
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
    Device.Destroy([
        storageBuffer,
        translationBuffer
    ], texture);
}
