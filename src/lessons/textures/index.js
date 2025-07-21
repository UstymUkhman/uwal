/**
 * @module Textures
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "#/index";
import { generateMipmaps } from "./mipmaps";
import Shader from "./Texture.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Texture"));
    }
    catch (error)
    {
        alert(error);
    }

    Renderer.CreatePipeline({ module: Renderer.CreateShaderModule([Shaders.Quad, Shader]) });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const width = 5;
    const scaleOffset = 0;
    const offsetOffset = 2;

    const settings = {
        addressModeU: TEXTURE.ADDRESS.REPEAT,
        addressModeV: TEXTURE.ADDRESS.REPEAT,
        magFilter: TEXTURE.FILTER.LINEAR,
        minFilter: TEXTURE.FILTER.LINEAR,
        scale: 1
    };

    const addressOptions = [TEXTURE.ADDRESS.REPEAT, TEXTURE.ADDRESS.CLAMP];
    const filterOptions = [TEXTURE.FILTER.NEAREST, TEXTURE.FILTER.LINEAR];

    const gui = new GUI();

    gui.add(settings, "addressModeU", addressOptions);
    gui.add(settings, "addressModeV", addressOptions);
    gui.add(settings, "magFilter", filterOptions);
    gui.add(settings, "minFilter", filterOptions);
    gui.add(settings, "scale", 0.5, 6);

    const r = new Color(0xff0000).RGBA;
    const y = new Color(0xffff00).RGBA;
    const b = new Color(0x0000ff).RGBA;

    const textureData = new Uint8Array([
        r, r, r, r, r,
        r, y, r, r, r,
        r, y, r, r, r,
        r, y, y, r, r,
        r, y, r, r, r,
        r, y, y, y, r,
        b, r, r, r, r
    ].flat());

    const mipmaps = generateMipmaps(textureData, width);
    const Texture = new (await UWAL.LegacyTexture());

    const texture = Texture.CreateTexture({
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        size: [mipmaps[0].width, mipmaps[0].height],
        mipLevelCount: mipmaps.length,
        format: "rgba8unorm"
    });

    mipmaps.forEach(({ data, width, height }, mipLevel) =>
        Texture.WriteTexture(data, {
            bytesPerRow: width * 4,
            texture, mipLevel,
            width, height
        }));

    const transformBufferSize =
        2 * Float32Array.BYTES_PER_ELEMENT + // Scale  - 2 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT;  // Offset - 2 32bit floats

    const transformBuffer = Renderer.CreateBuffer({
        size: transformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const transformValues = new Float32Array(transformBufferSize / Float32Array.BYTES_PER_ELEMENT);

    for (let s = 0; s < 16; s++)
    {
        const sampler = Texture.CreateSampler({
            addressModeU: (s & 1) ? TEXTURE.ADDRESS.REPEAT : TEXTURE.ADDRESS.CLAMP,
            addressModeV: (s & 2) ? TEXTURE.ADDRESS.REPEAT : TEXTURE.ADDRESS.CLAMP,
            magFilter:    (s & 4) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            minFilter:    (s & 8) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST
        });

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    sampler,
                    texture.createView(),
                    { buffer: transformBuffer }
                ])
            )
        );
    }

    /** @param {DOMHighResTimeStamp} time */
    function updateTransformBuffer(time)
    {
        const scaleX = 4 / canvas.width * settings.scale;
        const scaleY = 4 / canvas.height * settings.scale;

        // Draw the quad of 2x2 pixels onto the canvas:
        transformValues.set([scaleX, scaleY], scaleOffset);

        // Set the offset to animate the quad back and forth across the canvas:
        transformValues.set([Math.sin(time * 0.25) * 0.8, -0.8], offsetOffset);

        Renderer.WriteBuffer(transformBuffer, transformValues);
    }

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        const bindGroup = +(settings.addressModeU === TEXTURE.ADDRESS.REPEAT) * 1 +
                          +(settings.addressModeV === TEXTURE.ADDRESS.REPEAT) * 2 +
                          +(settings.magFilter    === TEXTURE.FILTER.LINEAR)  * 4 +
                          +(settings.minFilter    === TEXTURE.FILTER.LINEAR)  * 8;

        Renderer.SetActiveBindGroups(bindGroup);
        updateTransformBuffer(time * 0.001);
        Renderer.Render(6);

        requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize / 64 | 0, blockSize / 64 | 0, false);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);

    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "crisp-edges";
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
