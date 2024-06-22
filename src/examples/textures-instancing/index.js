/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, Shape, TEXTURE } from "@/index";
import Textures from "./Textures.wgsl";
import Logo from "~/assets/logo.jpg";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Textures / Instancing"));
    }
    catch (error)
    {
        alert(error);
    }

    let storage,
        vertices,
        translation,
        textureIndex,
        spawnTimeout,
        storageBuffer,
        timeout = 1000,
        showAll = false,
        halfCanvasWidth,
        halfCanvasHeight;

    const radius = 128, textures = 100, halfSide = Math.sqrt(2) * radius / 2;

    const descriptor = Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(undefined, "clear", "store", new Color(0x33194c).rgba)
    );

    const module = Renderer.CreateShaderModule([Shaders.ShapeVertex, Textures]);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "mainVertex", [
        {
            arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2")]    // Position
        },
        {
            stepMode: 'instance',
            arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2", 1)] // Translation
        }])
    });

    function clean()
    {
        cancelAnimationFrame(raf);
        halfCanvasWidth = canvas.width / 2;
        halfCanvasHeight = canvas.height / 2;
        canvas.removeEventListener("click", onTouch, false);
        canvas.removeEventListener("mousemove", onTouch, false);
    }

    async function start()
    {
        createShape();
        createStorageBuffer();
        createTranslationBuffer();
        await createLogoTexture();

        canvas.addEventListener("click", onTouch, false);
        canvas.addEventListener("mousemove", onTouch, false);

        spawnTimeout = setTimeout(spawnAll, timeout);
        render();
    }

    function createShape()
    {
        const shape = new Shape({
            renderer: Renderer,
            segments: 4,
            radius
        });

        shape.Position = [
            canvas.width / 2,
            canvas.height / 2
        ];

        shape.Rotation = Math.PI / 4;
        vertices = shape.Update().Vertices;
    }

    function createStorageBuffer()
    {
        const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
        const size = Uint32Array.BYTES_PER_ELEMENT * textures;

        storage = new Uint32Array(size / Uint32Array.BYTES_PER_ELEMENT);
        storageBuffer = Renderer.CreateBuffer({ size, usage });
        Renderer.WriteBuffer(storageBuffer, storage);
    }

    function createTranslationBuffer()
    {
        const x = 1 - halfSide / halfCanvasWidth, y = 1 - halfSide / halfCanvasHeight;
        const usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        const stride = Float32Array.BYTES_PER_ELEMENT * 2;
        const size = stride * textures;

        const translationBuffer = Renderer.CreateBuffer({ size, usage });
        const translationOffset = stride / Float32Array.BYTES_PER_ELEMENT;
        translation = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);

        for (let t = textures; t--; )
            translation.set([
                random(-x, x),
                random(-y, y)
            ], translationOffset * t);

        Renderer.AddVertexBuffers(translationBuffer);
        Renderer.WriteBuffer(translationBuffer, translation);
    }

    async function createLogoTexture()
    {
        const Texture = new (await UWAL.Texture());

        const logo = await Texture.CreateBitmapImage(
            await (await fetch(Logo)).blob(),
            { colorSpaceConversion: "none" }
        );

        const texture = Texture.CopyImageToTexture(logo, {
            flipY: true,
            create: {
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST,
                format: "rgba8unorm"
            }
        });

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler({
                        magFilter: TEXTURE.FILTER.LINEAR,
                        minFilter: TEXTURE.FILTER.LINEAR
                    }),
                    texture.createView(),
                    { buffer: storageBuffer }
                ]), 1
            )
        );
    }

    /** @param {PointerEvent} event */
    function onTouch({ offsetX, offsetY })
    {
        const t = textureIndex * 2;
        const tx = translation[t] * halfCanvasWidth + halfCanvasWidth;
        const ty = translation[t + 1] * -1 * halfCanvasHeight + halfCanvasHeight;

        const minX = tx - halfSide;
        const maxX = tx + halfSide;

        const minY = ty - halfSide;
        const maxY = ty + halfSide;

        if (minX < offsetX && offsetX < maxX && minY < offsetY && offsetY < maxY)
        {
            clearTimeout(spawnTimeout);
            spawnTimeout = setTimeout(spawnAll, timeout -= 250);
            render();
        }
    }

    /**
     * @param {number} [min]
     * @param {number} [max]
     */
    function random(min, max)
    {
             if (min === undefined) { min = 0;   max = 1; }
        else if (max === undefined) { max = min; min = 0; }

        return Math.random() * (max - min) + min;
    }

    function spawnAll()
    {
        clean();
        showAll = true;
        textureIndex = -1;
        raf = requestAnimationFrame(render);
    }

    function render()
    {
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        if (showAll)
            raf = requestAnimationFrame(render),
            ++textureIndex === storage.length - 1 &&
            cancelAnimationFrame(raf);

        else
            storage.fill(0),
            textureIndex = random(storage.length) | 0;

        storage[textureIndex] = 1;

        Renderer.WriteBuffer(storageBuffer, storage);
        Renderer.Render([vertices, textures]);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        clean(), start();
    });

    observer.observe(canvas);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
