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
import TextFrag from "./Text.frag.wgsl";
import Result from "./Result.wgsl";
import Wave from "./Wave.wgsl";

/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    let textTexture, wavesTexture, backgroundTexture;
    const mouse = new Array(2), WAVES = 128, SCALE = 4;
    let Title, Subtitle, shape, textPipeline, resultPipeline;
    let lastRender = performance.now(), texturesLoaded = false, moving = false;
    /** @type {Renderer} */ let Renderer, movement, minScale = canvas.width / 4800, current = 0;

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

    const randomAngle = () => Math.random() * Math.PI * 2;

    /** @param {string} src */
    const loadTexture = src => new Promise(resolve =>
    {
        const texture = new Image(); texture.src = src;
        texture.onload = () => resolve(texture);
    });

    /** @param {ImageBitmapSource} image */
    async function createWaveShape(image)
    {
        const texture = Texture.CopyImageToTexture(
            await Texture.CreateBitmapImage(image, { colorSpaceConversion: "none" }),
            { mipmaps: false, create: true }
        );

        shape = new Shape({
            renderer: Renderer,
            segments: 4,
            radius: 256
        });

        shape.Position = [
            canvas.width / 2,
            canvas.height / 2
        ];

        shape.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler({ filter: "linear" }),
                    texture.createView()
                ]), 1
            )
        );
    }

    function updateWaves()
    {
        const now = performance.now();
        const delta = (now - lastRender) / 1e3;

        const deltaD10 = delta * 0.1;
        const deltaM5  = delta * 5;
        const deltaM2  = delta * 2;

        if (moving)
        {
            current = (current + 1) % WAVES;

            const wave = waves[current];
            const angle = randomAngle();
            const offset = current * waveStructSize;

            waveValues.set([wave.angle = angle], offset + 2);
            waveValues.set([wave.scale = SCALE], offset + 3);
            waveValues.set([wave.alpha = 0.192], offset + 4);
        }

        for (let w = 0; w < WAVES; w++)
        {
            const wave = waves[w];
            const offset = w * waveStructSize;
            const scale = wave.scale * deltaM2;

			wave.alpha  = wave.alpha - deltaD10;
			wave.angle += wave.alpha * deltaM5 + deltaM2;
			wave.scale  = Math.max(wave.scale - scale, minScale);
            current === w && waveValues.set(mouse, offset);

            waveValues.set([wave.angle], offset + 2);
            waveValues.set([wave.scale], offset + 3);
            waveValues.set([wave.alpha], offset + 4);
        }

        Renderer.WriteBuffer(waveBuffer, waveValues);
        const vertices = shape.Update().Vertices;
        Renderer.AddVertexBuffers(waveBuffer);

        lastRender = now;
        return vertices;
    }

    /** @param {MouseEvent} event */
    function move(event)
    {
        moving = true;
        clearTimeout(movement);
        const [width, height] = Renderer.BaseCanvasSize;

        mouse[0] = event.clientX / width  *  2 - 1;
        mouse[1] = event.clientY / height * -2 + 1;
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

    const waveModule = Renderer.CreateShaderModule([Shaders.ShapeVertex, Wave]);
    const color = Renderer.CreateBlendComponent(void 0, "src-alpha", "one");
    const positionLayout = Renderer.CreateVertexBufferLayout("position");
    const waveTarget = Renderer.CreateTargetState(void 0, { color });

    const { buffer: waveBuffer, layout: waveLayout } = Renderer.CreateVertexBuffer(
        ["offset", "angle", "scale", "alpha"], WAVES, "instance"
    );

    const wavesPipeline = Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(waveModule, void 0, waveTarget),
        vertex: Renderer.CreateVertexState(waveModule, void 0, [
            positionLayout, waveLayout
        ]),
    });

    const wavesStructSize = waveBuffer.size / Float32Array.BYTES_PER_ELEMENT;
    const waveValues = new Float32Array(wavesStructSize);
    const waveStructSize = wavesStructSize / WAVES;

    const BackgroundUniform = { buffer: null, offset: null };
    const TexureUniform = { buffer: null, offset: null };
    const Texture = new (await UWAL.Texture(Renderer));

    const waves = Array.from({ length: WAVES }).map(() => ({
        angle: randomAngle(), scale: SCALE, alpha: 0
    }));

    Promise.all([
        loadTexture(Ocean),
        loadTexture(Ripple),
        loadTexture(BoldTexture),
        loadTexture(RegularTexture)
    ]).then(async ([ocean, ripple, bold, regular]) =>
    {
        await createWaveShape(ripple);
        const { module: textModule, target: textTarget } =
            await SDFText.GetFragmentStateParams(Renderer, TextFrag);

        const dsb = availableFeatures.has("dual-source-blending");
        const fragmentEntry = dsb && "dsbTextFragment" || void 0;

        const textLayout = Renderer.CreateVertexBufferLayout(
            ["position", "texture", "size"], void 0, "textVertex"
        );

        textPipeline = Renderer.CreatePipeline({
            fragment: Renderer.CreateFragmentState(textModule, fragmentEntry, textTarget),
            vertex: Renderer.CreateVertexState(textModule, "textVertex", textLayout)
        });

        const subtitleColor = new Color(0xff, 0xff, 0xff, 0xE5);
        const titleColor = new Color(0x00, 0x5a, 0x9c, 0xCC);

        Subtitle = new SDFText({
            color: subtitleColor,
            renderer: Renderer,
            font: RegularData,
            size: 24
        });

        Title = new SDFText({
            renderer: Renderer,
            color: titleColor,
            font: BoldData,
            size: 144
        });

        await Subtitle.SetFontTexture(regular);
        await Title.SetFontTexture(bold);

        Title.Write("UWAL");
        Subtitle.Write("Unopinionated WebGPU Abstraction Library");

        wavesTexture = Texture.CreateStorageTexture({ usage: GPUTextureUsage.RENDER_ATTACHMENT });
        textTexture = Texture.CreateStorageTexture({ usage: GPUTextureUsage.RENDER_ATTACHMENT });
        backgroundTexture = Texture.CopyImageToTexture(ocean, { mipmaps: false, create: true });

        const { buffer: texureBuffer, TexureOffset } =
            Renderer.CreateUniformBuffer("TexureOffset");

        TexureOffset.set(getTextureOffset(backgroundTexture));
        Renderer.WriteBuffer(texureBuffer, TexureOffset);

        TexureUniform.buffer = texureBuffer;
        TexureUniform.offset = TexureOffset;

        !dsb && Title.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    backgroundTexture.createView(),
                    Texture.CreateSampler(),
                    { buffer: texureBuffer }
                ]), 1
            )
        );

        resultPipeline = Renderer.CreatePipeline(
            Renderer.CreateShaderModule([Shaders.Quad, Result])
        );

        const { buffer: backgroundBuffer, BackgroundOffset } =
            Renderer.CreateUniformBuffer("BackgroundOffset");

        BackgroundOffset.set(getBackgroundOffset(backgroundTexture));
        Renderer.WriteBuffer(backgroundBuffer, BackgroundOffset);

        BackgroundUniform.buffer = backgroundBuffer;
        BackgroundUniform.offset = BackgroundOffset;

        addEventListener("mousemove", move, false);
        const dpr = Renderer.DevicePixelRatio;

        Subtitle.Position = [0, 100 * dpr];
        Title.Position = [0, -100 * dpr];

        requestAnimationFrame(render);
        texturesLoaded = true;
    });

    function render()
    {
        Renderer.SetPipeline(wavesPipeline);
        Renderer.TextureView = wavesTexture.createView();
        Renderer.Render([updateWaves(), WAVES], false);

        Renderer.DestroyCurrentPass();
        Renderer.ResetPipelineState();
        Renderer.SetPipeline(textPipeline);
        Renderer.TextureView = textTexture.createView();

        Title.Render(false);
        Subtitle.Render(false);
        Renderer.DestroyCurrentPass();
        Renderer.SetPipeline(resultPipeline);

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler(),
                    textTexture.createView(),
                    wavesTexture.createView(),
                    backgroundTexture.createView(),
                    { buffer: BackgroundUniform.buffer }
                ])
            )
        );

        requestAnimationFrame(render);
        Renderer.TextureView = void 0;
        Renderer.Render(6);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);

            if (!texturesLoaded) return;
            minScale = width / 4800;

            Title.Resize(); Subtitle.Resize();
            textTexture.destroy(); wavesTexture.destroy();

            shape.Position = [canvas.width / 2, canvas.height / 2];

            TexureUniform.offset.set(getTextureOffset(backgroundTexture));
            Renderer.WriteBuffer(TexureUniform.buffer, TexureUniform.offset);

            BackgroundUniform.offset.set(getBackgroundOffset(backgroundTexture));
            Renderer.WriteBuffer(BackgroundUniform.buffer, BackgroundUniform.offset);

            textTexture = Texture.CreateStorageTexture({ usage: GPUTextureUsage.RENDER_ATTACHMENT });
            wavesTexture = Texture.CreateStorageTexture({ usage: GPUTextureUsage.RENDER_ATTACHMENT });
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
