/**
 * @example Text Rendering
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by astiopin's "webgl_fonts"
 * {@link https://astiopin.github.io/webgl_fonts}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.10
 * @license MIT
 */

import { UWAL, SDFText, Shaders, Color, Shape } from "#/index";
import RegularTexture from "/assets/fonts/roboto-regular.png";
import RegularData from "/assets/fonts/roboto-regular.json";
import BoldTexture from "/assets/fonts/roboto-bold.png";
import BoldData from "/assets/fonts/roboto-bold.json";
import Ripple from "/assets/images/ripple.png";
import Ocean from "/assets/images/ocean.jpg";
import Framebuffer from "./Framebuffer.wgsl";
import Background from "./Background.wgsl";
import Wave from "./Wave.wgsl";

/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {Renderer} */ let Renderer;
    const MAX_SCALE = 4, WAVES = 64, mouse = [0, 0];
    let texturesLoaded = false, moving = false, current = 0, lastRender, movement;

    const availableFeatures = await UWAL.SetRequiredFeatures([
        // https://caniuse.com/?search=dual-source-blending:
        /* "dual-source-blending", */ "bgra8unorm-storage"
    ]);

    function getTextureOffset(texture, offset = [0.5, 0.5])
    {
        const [width, height] = Renderer.CanvasSize;
        const imageAspectRatio = texture.width / texture.height;

        if (Renderer.AspectRatio < imageAspectRatio)
        {
            const targetWidth = height * imageAspectRatio;
            offset[0] = width / targetWidth;
        }
        else
        {
            const targetHeight = width / imageAspectRatio;
            offset[1] = height / targetHeight;
        }

        return offset;
    }

    function getBackgroundOffset(texture, offset = [0, 0])
    {
        const [width, height] = Renderer.CanvasSize;
        const imageAspectRatio = texture.width / texture.height;

        if (Renderer.AspectRatio < imageAspectRatio)
        {
            const targetWidth = height * imageAspectRatio;
            offset[0] = (targetWidth - width) / 2 / targetWidth * -1;
        }
        else
        {
            const targetHeight = width / imageAspectRatio;
            offset[1] = (targetHeight - height) / 2 / targetHeight;
        }

        return offset;
    }

    /** @param {string} src */
    const loadTexture = src => new Promise(resolve =>
    {
        const texture = new Image(); texture.src = src;
        texture.onload = () => resolve(texture);
    });

    /** @param {ImageBitmapSource} ripple */
    async function createWaveShape(ripple)
    {
        const rippleTexture = Texture.CopyImageToTexture(
            await Texture.CreateBitmapImage(ripple, { colorSpaceConversion: "none" }),
            { mipmaps: false, create: true }
        );

        const shape = new Shape({
            renderer: Renderer,
            segments: 4,
            radius: 128
        });

        shape.Position = [
            canvas.width / 2,
            canvas.height / 2
        ];

        shape.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler({ filter: "linear" }),
                    rippleTexture.createView()
                ]), 1
            )
        );

        return shape;
    }

    /** @param {Shape} shape */
    function updateWaves(shape)
    {
        const now = performance.now();
        const delta = (now - lastRender) / 1e3;

        if (moving)
        {
            current = (current + 1) % WAVES;
            const wave = waves[current];
            const offset = current * waveStructSize;

            waveValues.set([MAX_SCALE], offset + 2);
            waveValues.set([1], offset + 3);

            wave.scale = MAX_SCALE;
            wave.alpha = 1;
        }

        for (let w = 0; w < WAVES; w++)
        {
            const wave = waves[w];
            if (wave.alpha === 0.002) continue;

            const offset = w * waveStructSize;
            current === w && waveValues.set(mouse, offset);

            waveValues.set([wave.scale], offset + 2);
            waveValues.set([wave.alpha], offset + 3);

            wave.alpha = Math.max(wave.alpha - delta / MAX_SCALE, 0.002);
            wave.scale = Math.max(wave.scale - delta, 0);
        }

        const scale = 2/*.5 */ - waves[current].scale / MAX_SCALE;
        shape.Scale = [scale, scale];
        shape.Rotation -= delta;
        lastRender = now;

        Renderer.WriteBuffer(waveBuffer, waveValues);
        return shape.Update().Vertices;
    }

    /** @param {MouseEvent} event */
    function move(event)
    {
        moving = true;
        clearTimeout(movement);

        mouse[0] = event.offsetX / canvas.width  *  2 - 1;
        mouse[1] = event.offsetY / canvas.height * -2 + 1;

        movement = setTimeout(() => moving = false, 16.667);
    }

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Text Rendering"));
    }
    catch (error)
    {
        alert(error);
    }

    const waves = Array.from({ length: WAVES }).map(() => ({ scale: MAX_SCALE, alpha: 1 }));
    const module = Renderer.CreateShaderModule([Shaders.ShapeVertex, Wave]);
    const positionLayout = Renderer.CreateVertexBufferLayout("position");

    const { buffer: waveBuffer, layout: waveLayout } =
        Renderer.CreateVertexBuffer(["offset", "scale", "alpha"], WAVES, "instance");

    // offset + scale + alpha = vec2f + f32 + f32 = 4:
    const waveStructSize = waveBuffer.size / WAVES / 4;
    const waveValues = new Float32Array(
        waveBuffer.size / Float32Array.BYTES_PER_ELEMENT
    );

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, void 0, [
            positionLayout, waveLayout
        ]),
    });

    /* const { module, target } = await SDFText.GetFragmentStateParams(Renderer, Framebuffer);

    const dsb = availableFeatures.has("dual-source-blending");
    const fragmentEntry = dsb && "dsbTextFragment" || void 0;

    const layout = Renderer.CreateVertexBufferLayout(
        ["position", "texture", "size"], void 0, "textVertex"
    );

    const textPipeline = Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module, fragmentEntry, target),
        vertex: Renderer.CreateVertexState(module, "textVertex", layout)
    });

    const TexureUniform = { buffer: null, offset: null };
    const BackgroundUniform = { buffer: null, offset: null };

    const subtitleColor = new Color(0xff, 0xff, 0xff, 0xE5);
    const titleColor = new Color(0x00, 0x5a, 0x9c, 0xCC);

    let storageTexture, oceanTexture, backgroundPipeline; */
    const Texture = new (await UWAL.Texture(Renderer));

    /* const Title = new SDFText({
        renderer: Renderer,
        color: titleColor,
        font: BoldData,
        size: 144
    });

    const Subtitle = new SDFText({
        color: subtitleColor,
        renderer: Renderer,
        font: RegularData,
        size: 24
    }); */

    Promise.all([
        loadTexture(Ocean),
        loadTexture(Ripple),
        loadTexture(BoldTexture),
        loadTexture(RegularTexture)
    ]).then(async ([ocean, ripple, bold, regular]) =>
    {
        lastRender = performance.now();
        const shape = await createWaveShape(ripple);

        requestAnimationFrame(render.bind(null, shape));
        addEventListener("mousemove", move, false);

        /* await Subtitle.SetFontTexture(regular);
        await Title.SetFontTexture(bold);

        Title.Write("UWAL");
        Subtitle.Write("Unopinionated WebGPU Abstraction Library");

        const { buffer: texureBuffer, TexureOffset } = Renderer.CreateUniformBuffer("TexureOffset");
        storageTexture = Texture.CreateStorageTexture({ usage: GPUTextureUsage.RENDER_ATTACHMENT });
        oceanTexture = Texture.CopyImageToTexture(ocean, { mipmaps: false, create: true });

        Renderer.TextureView = storageTexture.createView();
        TexureOffset.set(getTextureOffset(oceanTexture));
        Renderer.WriteBuffer(texureBuffer, TexureOffset);

        TexureUniform.buffer = texureBuffer;
        TexureUniform.offset = TexureOffset;

        !dsb && Title.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    oceanTexture.createView(),
                    Texture.CreateSampler(),
                    { buffer: texureBuffer }
                ]), 1
            )
        );

        backgroundPipeline = Renderer.CreatePipeline(
            Renderer.CreateShaderModule([Shaders.Quad, Background])
        );

        const { buffer: backgroundBuffer, BackgroundOffset } =
            Renderer.CreateUniformBuffer("BackgroundOffset");

        BackgroundUniform.buffer = backgroundBuffer;
        BackgroundUniform.offset = BackgroundOffset;

        Subtitle.Position = [0, 100];
        Title.Position = [0, -100];
        texturesLoaded = true; */
    });

    /** @param {Shape} shape */
    function render(shape)
    {
        const vertices = updateWaves(shape);
        Renderer.AddVertexBuffers(waveBuffer);

        Renderer.Render([vertices, WAVES]);
        requestAnimationFrame(render.bind(null, shape));

        /* Renderer.SetPipeline(textPipeline);
        Renderer.TextureView = storageTexture.createView();
        TexureUniform.offset.set(getTextureOffset(oceanTexture));
        Renderer.WriteBuffer(TexureUniform.buffer, TexureUniform.offset);

        Title.Render(false);
        Subtitle.Render(false);
        Renderer.DestroyCurrentPass();
        Renderer.SetPipeline(backgroundPipeline);

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler(),
                    storageTexture.createView(),
                    oceanTexture.createView(),
                    { buffer: BackgroundUniform.buffer }
                ])
            )
        );

        BackgroundUniform.offset.set(getBackgroundOffset(oceanTexture));
        Renderer.WriteBuffer(BackgroundUniform.buffer, BackgroundUniform.offset);
        Renderer.TextureView = undefined;
        Renderer.Render(6); */
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);

            /* if (!texturesLoaded) return;
            storageTexture.destroy();

            storageTexture = Texture.CreateStorageTexture({
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });

            Subtitle.Resize();
            Title.Resize();
            render(); */
        }
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    observer.disconnect();
    UWAL.Destroy();
}
