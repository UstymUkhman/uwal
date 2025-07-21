/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, LegacyShape, TEXTURE } from "#/index";
import Logo from "/assets/images/logo.jpg";
import Texture from "./Texture.wgsl";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;
let texture, uniformBuffer, storageBuffer, translationBuffer;

/** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Textures / Instancing"));
    }
    catch (error)
    {
        alert(error);
    }

    const radius = 128, textures = 256;

    let storage, vertices, spawnTimeout, textureIndex,
        textureUpdate = 512, lastRender = performance.now() - textureUpdate;

    const module = Renderer.CreateShaderModule([Shaders.ShapeVertex, Texture]);

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x19334c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, void 0, [
        {
            arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2")]    // Position
        },
        {
            stepMode: "instance",
            arrayStride: Float32Array.BYTES_PER_ELEMENT * 2,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x2", 1)] // Translation
        }])
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
        createUniformBuffer();
        createStorageBuffer();
        createTranslationBuffer();
        await createLogoTexture();
        requestAnimationFrame(render);

        spawnTimeout = setTimeout(() =>
            textureUpdate = ~(textureIndex = -1)
        , textureUpdate * 3);
    }

    function createShape()
    {
        const shape = new LegacyShape({
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

    function createUniformBuffer()
    {
        const usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;
        const size = Float32Array.BYTES_PER_ELEMENT;

        uniformBuffer = Renderer.CreateBuffer({ size, usage });
        Renderer.WriteBuffer(uniformBuffer, new Float32Array([devicePixelRatio]));
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
        const y = 1 - Math.sqrt(2) * radius / canvas.height;
        const x = 1 - Math.sqrt(2) * radius / canvas.width;
        const stride = Float32Array.BYTES_PER_ELEMENT * 2;
        const size = stride * textures;

        const usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        const translationOffset = stride / Float32Array.BYTES_PER_ELEMENT;
        const translation = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);

        for (let t = textures; t--; )
            translation.set([random(-x, x), random(-y, y)], translationOffset * t);

        translationBuffer = Renderer.CreateBuffer({ size, usage });
        Renderer.WriteBuffer(translationBuffer, translation);
        Renderer.AddVertexBuffers(translationBuffer);
    }

    async function createLogoTexture()
    {
        const Texture = new (await UWAL.LegacyTexture());

        const logo = await Texture.CreateBitmapImage(
            await (await fetch(Logo)).blob(),
            { colorSpaceConversion: "none" }
        );

        texture = Texture.CopyImageToTexture(logo, {
            flipY: true,
            create: {
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST,
                format: "rgba8unorm",
                mipmaps: false
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
                    { buffer: uniformBuffer },
                    { buffer: storageBuffer }
                ]), 1
            )
        );
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

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        raf = requestAnimationFrame(render);
        if (time - lastRender < textureUpdate) return;

        textureUpdate
            ? storage.fill(0) && (textureIndex = random(storage.length) | 0)
            : ++textureIndex === storage.length - 1 && cancelAnimationFrame(raf);

        lastRender = time;
        storage[textureIndex] = 1;

        Renderer.WriteBuffer(storageBuffer, storage);
        Renderer.Render([vertices, textures]);
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
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();

    UWAL.Destroy([
        uniformBuffer,
        storageBuffer,
        translationBuffer
    ], texture);
}
