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

    const storageShader = `
        @group(1) @binding(0) var StorageTexture: texture_storage_2d<${presentationFormat}, write>;
        ${Framebuffer}
    `;

    const { module, target } = await SDFText.GetFragmentStateParams(Renderer, storageShader);

    const layout = Renderer.CreateVertexBufferLayout(
        ["position", "texture", "size"], void 0, "textVertex"
    );

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module, "textVertex", layout),
        fragment: Renderer.CreateFragmentState(module, void 0, target)
    });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0xffffff).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    // const subtitleColor = new Color(0xffffff);
    const titleColor = new Color(0x005a9c);
    const subtitleColor = new Color();
    const background = new Color();

    // subtitleColor.a = 0.9;
    // titleColor.a = 0.8;

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

            Title.Write("UWAL");
            Subtitle.Write("Unopinionated WebGPU Abstraction Library");

            const Texture = new (await UWAL.Texture(Renderer));
            const [width, height] = Renderer.CanvasSize;
            const ocean = await loadFontTexture(Ocean);

            const storageTexture = Texture.CreateTexture({
                usage: GPUTextureUsage.STORAGE_BINDING |
                    GPUTextureUsage.TEXTURE_BINDING,
                format: preferredFormat,
                size: [width, height]
            });

            const oceanTexture = Texture.CopyImageToTexture(ocean, { mipmaps: false, create: true });
            const { buffer, TexureOffset } = Renderer.CreateUniformBuffer("TexureOffset");

            TexureOffset.set(getTextureOffset(oceanTexture));
            Renderer.WriteBuffer(buffer, TexureOffset);

            Title.AddBindGroups(
                Renderer.CreateBindGroup(
                    Renderer.CreateBindGroupEntries([
                        storageTexture.createView(),
                        oceanTexture.createView(),
                        Texture.CreateSampler(),
                        { buffer }
                    ]), 1
                )
            );

            Subtitle.Position = [0, 200];
            Title.Position = [0, -200];

            texturesLoaded = true;
            Title.Render(false);
            Subtitle.Render();

            console.log(oceanTexture, storageTexture);

            setTimeout(() => renderTextures.apply(null, [
                oceanTexture, storageTexture
            ]), 500);
        })
    );

    /** @param {GPUTexture[]} textures */
    async function renderTextures(background, storage)
    {
        Renderer.CreatePipeline(Renderer.CreateShaderModule([Shaders.Quad, Background]));
        const { buffer, offset } = Renderer.CreateUniformBuffer("offset");
        const Texture = new (await UWAL.Texture());

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    Texture.CreateSampler(),
                    background.createView(),
                    storage.createView(),
                    { buffer }
                ])
            )
        );

        offset.set(getBackgroundOffset(background));
        Renderer.WriteBuffer(buffer, offset.buffer);
        Renderer.Render(6);
    }

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

            if (!texturesLoaded) return;
            Title.Resize(); Subtitle.Resize();
            Title.Render(false); Subtitle.Render();
        }
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    // cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
