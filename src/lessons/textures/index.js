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

import { UWAL, Color, Shaders } from "@/index";
import { generateMipmaps } from "./mipmaps";
import Texture from "./Texture.wgsl";

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

    const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
        undefined, "clear", "store", new Color(0x4c4c4c).rgba
    ));

    const module = Renderer.CreateShaderModule([Shaders.Quad, Texture]);

    const device = await UWAL.Device;

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module),
        fragment: Renderer.CreateFragmentState(module)
    });

    const width = 5;
    const scaleOffset = 0;
    const offsetOffset = 2;

    const settings = {
        addressModeU: "repeat",
        addressModeV: "repeat",
        magFilter: "linear",
        minFilter: "linear",
        scale: 1
    };

    const addressOptions = ["repeat", "clamp-to-edge"];
    const filterOptions = ["nearest", "linear"];

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

    const texture = device.createTexture({
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        size: [mipmaps[0].width, mipmaps[0].height],
        mipLevelCount: mipmaps.length,
        format: "rgba8unorm"
    });

    mipmaps.forEach(({ data, width, height }, mipLevel) =>
    {
        device.queue.writeTexture(
            { texture, mipLevel },
            data,
            { bytesPerRow: width * 4 },
            { width, height }
        );
    });

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
        const sampler = device.createSampler({
            addressModeU: (s & 1) ? "repeat" : "clamp-to-edge",
            addressModeV: (s & 2) ? "repeat" : "clamp-to-edge",
            magFilter:    (s & 4) ? "linear" : "nearest",
            minFilter:    (s & 8) ? "linear" : "nearest"
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
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        const bindGroup = +(settings.addressModeU === "repeat") * 1 +
                          +(settings.addressModeV === "repeat") * 2 +
                          +(settings.magFilter    === "linear") * 4 +
                          +(settings.minFilter    === "linear") * 8;

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
            Renderer.SetCanvasSize(inlineSize / 64 | 0, blockSize / 64 | 0);
        }

        requestAnimationFrame(render);
    });

    observer.observe(canvas);

    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "crisp-edges";
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
