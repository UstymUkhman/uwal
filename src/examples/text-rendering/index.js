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

import { UWAL, TEXTURE, SDFText, Shaders, Color } from "#/index";
import RegularTexture from "/assets/fonts/roboto-regular.png";
import RegularData from "/assets/fonts/roboto-regular.json";
import BoldTexture from "/assets/fonts/roboto-bold.png";
import BoldData from "/assets/fonts/roboto-bold.json";
import Ocean from "/assets/images/ocean.jpg";
import Framebuffer from "./Framebuffer.wgsl";
import Background from "./Background.wgsl";

/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    const preferredFormat = UWAL.PreferredCanvasFormat;

    const availableFeatures = await UWAL.SetRequiredFeatures([
        // https://caniuse.com/?search=dual-source-blending:
        // "dual-source-blending",
        "bgra8unorm-storage"
    ]);

    const presentationFormat =
        availableFeatures.has("bgra8unorm-storage") &&
        preferredFormat === "bgra8unorm" ? preferredFormat : "rgba8unorm";

    /** @type {Renderer} */ let Renderer, texturesLoaded = false;

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

    const { module, target, constants } =
        await SDFText.GetFragmentStateParams(Renderer, Framebuffer);

    const dsb = availableFeatures.has("dual-source-blending");
    const fragmentEntry = dsb && "dsbTextFragment" || void 0;

    const layout = Renderer.CreateVertexBufferLayout(
        ["position", "texture", "size"], void 0, "textVertex"
    );

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module, fragmentEntry, target, constants),
        vertex: Renderer.CreateVertexState(module, "textVertex", layout)
    });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0xffffff).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const subtitleColor = new Color(0xff, 0xff, 0xff, 0xE5),
        titleColor = new Color(0x00, 0x5a, 0x9c, 0xCC),
        background = new Color();

    const Title = new SDFText({
        renderer: Renderer,
        color: titleColor,
        font: BoldData,
        background,
        size: 144
    });

    const Subtitle = new SDFText({
        color: subtitleColor,
        renderer: Renderer,
        font: RegularData,
        background,
        size: 24
    });

    loadFontTexture(RegularTexture).then(regularTexture =>
        loadFontTexture(BoldTexture).then(async boldTexture =>
        {
            await Title.SetFontTexture(boldTexture);
            await Subtitle.SetFontTexture(regularTexture);
            const Texture = new (await UWAL.Texture());
            const ocean = await loadFontTexture(Ocean);

            Title.Write("UWAL");
            Subtitle.Write("Unopinionated WebGPU Abstraction Library");

            const storageTexture = Texture.CreateTexture({
                usage: GPUTextureUsage.RENDER_ATTACHMENT |
                    TEXTURE.USAGE.STORAGE,
                size: Renderer.CanvasSize,
                format: preferredFormat,
            });

            const { buffer: texureBuffer, TexureOffset } = Renderer.CreateUniformBuffer("TexureOffset");
            Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(storageTexture.createView()));
            const oceanTexture = Texture.CopyImageToTexture(ocean, { mipmaps: false, create: true });

            TexureOffset.set(getTextureOffset(oceanTexture));
            Renderer.WriteBuffer(texureBuffer, TexureOffset);

            !dsb && Title.AddBindGroups(
                Renderer.CreateBindGroup(
                    Renderer.CreateBindGroupEntries([
                        oceanTexture.createView(),
                        Texture.CreateSampler(),
                        { buffer: texureBuffer }
                    ]), 1
                )
            );

            Subtitle.Position = [0, 200];
            Title.Position = [0, -200];
            texturesLoaded = true;

            Title.Render(false);
            Subtitle.Render(false);
            Renderer.DestroyCurrentPass();

            Renderer.CreatePipeline(Renderer.CreateShaderModule([Shaders.Quad, Background]));
            Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment());

            const { buffer: backgroundBuffer, BackgroundOffset } =
                Renderer.CreateUniformBuffer("BackgroundOffset");

            Renderer.SetBindGroups(
                Renderer.CreateBindGroup(
                    Renderer.CreateBindGroupEntries([
                        Texture.CreateSampler(),
                        storageTexture.createView(),
                        oceanTexture.createView(),
                        { buffer: backgroundBuffer }
                    ])
                )
            );

            BackgroundOffset.set(getBackgroundOffset(oceanTexture));
            Renderer.WriteBuffer(backgroundBuffer, BackgroundOffset);
            Renderer.Render(6);
        })
    );

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

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
            /* if (!texturesLoaded) */ return;

            Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(storageTexture.createView()));
            TexureOffset.set(getTextureOffset(oceanTexture));
            Renderer.WriteBuffer(texureBuffer, TexureOffset);

            Title.Resize();
            Subtitle.Resize();
            Title.Render(false);
            Subtitle.Render(false);
            Renderer.DestroyCurrentPass();

            Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment());
            BackgroundOffset.set(getBackgroundOffset(oceanTexture));
            Renderer.WriteBuffer(backgroundBuffer, BackgroundOffset);
            Renderer.Render(6);
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
