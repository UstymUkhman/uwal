/**
 * @module Loading Images
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import F from "/assets/image/f.png";
import Images from "./Images.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Loading Images"));
    }
    catch (error)
    {
        alert(error);
    }

    Renderer.CreatePipeline({ module: Renderer.CreateShaderModule([Shaders.Quad, Images]) });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const settings = {
        addressModeU: TEXTURE.ADDRESS.REPEAT,
        addressModeV: TEXTURE.ADDRESS.REPEAT,
        magFilter: TEXTURE.FILTER.LINEAR
    };

    const addressOptions = [TEXTURE.ADDRESS.REPEAT, TEXTURE.ADDRESS.CLAMP];
    const filterOptions = [TEXTURE.FILTER.NEAREST, TEXTURE.FILTER.LINEAR];

    const gui = new GUI();

    gui.add(settings, "addressModeU", addressOptions);
    gui.add(settings, "addressModeV", addressOptions);
    gui.add(settings, "magFilter", filterOptions);

    Object.assign(gui.domElement.style, {
        left: "15px",
        right: ""
    });

    /** @param {string} url */
    const loadImageBitmap = async url =>
        await Texture.CreateBitmapImage(
            await (await fetch(url)).blob(),
            { colorSpaceConversion: "none" }
        );

    const Texture = new (await UWAL.Texture());
    const source = await loadImageBitmap(F);

    const texture = Texture.CopyImageToTexture(source, {
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

    for (let s = 0; s < 8; s++)
    {
        const sampler = Texture.CreateSampler({
            addressModeU: (s & 1) ? TEXTURE.ADDRESS.REPEAT : TEXTURE.ADDRESS.CLAMP,
            addressModeV: (s & 2) ? TEXTURE.ADDRESS.REPEAT : TEXTURE.ADDRESS.CLAMP,
            magFilter:    (s & 4) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST
        });

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    sampler, texture.createView()
                ])
            )
        );
    }

    function render()
    {
        const bindGroup = +(settings.addressModeU === TEXTURE.ADDRESS.REPEAT) * 1 +
                          +(settings.addressModeV === TEXTURE.ADDRESS.REPEAT) * 2 +
                          +(settings.magFilter    === TEXTURE.FILTER.LINEAR)  * 4;

        Renderer.SetActiveBindGroups(bindGroup);
        Renderer.Render(6);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        render();
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
