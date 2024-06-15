/**
 * @example Textures / Instancing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, Shape } from "@/index";
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

    let vertices,
        translation,
        translationBuffer,
        translationOffset;

    const radius = 100,
          textures = 5,
          offset = 1 - 10 / (radius - (
              radius - Math.sqrt(2) * radius / 2
          ));

    const descriptor = Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(undefined, "clear", "store", new Color(0x19334c).rgba)
    );

    const module = Renderer.CreateShaderModule([Shaders.Resolution, Textures]);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "vertex", [
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
    }

    function start()
    {
        createShape();
        createTranslation();
        // createLogoTexture().then(render);
        raf = requestAnimationFrame(render);
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
        shape.Color = new Color(0xffffff).rgba;

        vertices = shape.Update().Vertices;
    }

    function createTranslation()
    {
        const usage = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;
        const stride = Float32Array.BYTES_PER_ELEMENT * 2;
        const size = stride * textures;

        translationOffset = stride / Float32Array.BYTES_PER_ELEMENT;
        translation = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);
        Renderer.AddVertexBuffers(translationBuffer = Renderer.CreateBuffer({ size, usage }));
    }

    async function createLogoTexture()
    {
        const Texture = new (await UWAL.Texture());

        const logo = await Texture.CreateBitmapImage(
            await (await fetch(Logo)).blob(),
            { colorSpaceConversion: "none" }
        );

        const texture = Texture.CreateTexture({
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,

            size: [logo.width, logo.height],
            format: "rgba8unorm"
        });

        Texture.CopyImageToTexture(logo, { texture, flipY: true });

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler(),
                    texture.createView()
                ], [2, 3])
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

    function render()
    {
        // raf = requestAnimationFrame(render);
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        for (let t = 0; t < textures; t++)
        {
            const x = random(-offset, offset);
            const y = random(-offset, offset);

            translation.set([x, y], translationOffset * t);
        }

        Renderer.WriteBuffer(translationBuffer, translation);
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
