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

import RegularTexture from "/assets/fonts/roboto-regular.png";
import RegularData from "/assets/fonts/roboto-regular.json";
import { UWAL, SDFText, Shaders, Color } from "#/index";
import BoldTexture from "/assets/fonts/roboto-bold.png";
import BoldData from "/assets/fonts/roboto-bold.json";
import Ocean from "/assets/images/ocean.jpg";
import Framebuffer from "./Framebuffer.wgsl";
import Background from "./Background.wgsl";

/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {Renderer} */ let Renderer, texturesLoaded = false;

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
    const loadFontTexture = src => new Promise(resolve =>
    {
        const texture = new Image(); texture.src = src;
        texture.onload = () => resolve(texture);
    });

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Text Rendering"));
    }
    catch (error)
    {
        alert(error);
    }

    const { module, target } = await SDFText.GetFragmentStateParams(Renderer, Framebuffer);

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

    let storageTexture, oceanTexture, backgroundPipeline;
    const Texture = new (await UWAL.Texture(Renderer));

    const Title = new SDFText({
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
    });

    Promise.all([
        loadFontTexture(Ocean),
        loadFontTexture(BoldTexture),
        loadFontTexture(RegularTexture)
    ]).then(async ([ocean, boldTexture, regularTexture]) =>
    {
        await Subtitle.SetFontTexture(regularTexture);
        await Title.SetFontTexture(boldTexture);

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

        Subtitle.Position = [0, 100];
        Title.Position = [0, -100];
        texturesLoaded = true;

        Title.Render(false);
        Subtitle.Render(false);
        Renderer.DestroyCurrentPass();

        backgroundPipeline = Renderer.CreatePipeline(
            Renderer.CreateShaderModule([Shaders.Quad, Background])
        );

        const { buffer: backgroundBuffer, BackgroundOffset } =
            Renderer.CreateUniformBuffer("BackgroundOffset");

        BackgroundUniform.buffer = backgroundBuffer;
        BackgroundUniform.offset = BackgroundOffset;

        render();
    });

    function render()
    {
        Renderer.SetPipeline(textPipeline);
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
            storageTexture.destroy();

            storageTexture = Texture.CreateStorageTexture({
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });

            Subtitle.Resize();
            Title.Resize();
            render();
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
