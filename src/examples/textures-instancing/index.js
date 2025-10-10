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

    const camera = new Camera2D();
    const radius = 128, textures = 256;

    const TexturesPipeline = new Renderer.Pipeline();
    const geometry = new Geometries.Shape({ radius });

    let storage, vertices, spawnTimeout, textureIndex, lastTexture,
        textureUpdate = 512, lastRender = performance.now() - textureUpdate;

    const module = TexturesPipeline.CreateShaderModule([Shaders.ShapeVertex, Texture]);
    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new Color(0x19334c)));

    const { buffer: translationBuffer, layout: translationLayout } =
        TexturesPipeline.CreateVertexBuffer("translation", textures, "instance", "textureVertex");

    await Renderer.AddPipeline(TexturesPipeline, {
        fragment: TexturesPipeline.CreateFragmentState(module),
        vertex: TexturesPipeline.CreateVertexState(module, [
            geometry.GetPositionBufferLayout(TexturesPipeline), translationLayout
        ], void 0, "textureVertex")
    });

    setTranslationData();

    function clean()
    {
        cancelAnimationFrame(raf);
        clearTimeout(spawnTimeout);
        lastRender = performance.now() - textureUpdate;
    }

    async function start()
    {
        createShape();
        createStorageBuffer();
        await createLogoTexture();
        requestAnimationFrame(render);

        spawnTimeout = setTimeout(() =>
            textureUpdate = ~(textureIndex = -1)
        , textureUpdate * 3);
    }

    function createShape()
    {
        const shape = new Shape(geometry, null);
        shape.SetRenderPipeline(TexturesPipeline);
        const [width, height] = Renderer.CanvasSize;

        TexturesPipeline.AddVertexBuffers(translationBuffer);
        TexturesPipeline.SetDrawParams(geometry.Vertices, textures);

        shape.Transform = [[width / 2, height / 2], Math.PI / 4];
        shape.UpdateProjectionMatrix(camera.ProjectionMatrix);
    }

    function setTranslationData()
    {
        const translation = new Float32Array(textures * 2);
        const x = 1 - Math.sqrt(2) * radius / canvas.offsetWidth;
        const y = 1 - Math.sqrt(2) * radius / canvas.offsetHeight;

        for (let t = textures; t--; )
        {
            const rx = MathUtils.Random(-x, x);
            const ry = MathUtils.Random(-y, y);
            translation.set([rx, ry], t * 2);
        }

        TexturesPipeline.WriteBuffer(translationBuffer, translation);
    }

    function createStorageBuffer()
    {
        const Storage = TexturesPipeline.CreateStorageBuffer("visible", textures);
        TexturesPipeline.WriteBuffer(Storage.buffer, Storage.visible);
        lastTexture = (storage = Storage.visible).length - 1;
        storageBuffer = Storage.buffer;
    }

    async function createLogoTexture()
    {
        const { ResolutionBuffer } = Renderer;
        const Texture = new (await Device.Texture());

        texture = await Texture.CopyImageToTexture(
            await Texture.CreateImageBitmap(Logo),
            { flipY: true, create: { mipmaps: false } }
        );

        TexturesPipeline.AddBindGroupFromResources([
            Texture.CreateSampler(),
            texture.createView(),
            ResolutionBuffer,
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
            camera.Size = Renderer.CanvasSize;
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
