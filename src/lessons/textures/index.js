/**
 * @module Textures
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL, Shaders } from "@/index";
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
        undefined, "clear", "store", [0.3, 0.3, 0.3, 1]
    ));

    const module = Renderer.CreateShaderModule([Shaders.Quad, Texture]);

    const device = await UWAL.Device;

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module),
        fragment: Renderer.CreateFragmentState(module)
    });

    const width = 5;
    const height = 7;

    const r = [255,   0,   0, 255];
    const y = [255, 255,   0, 255];
    const b = [  0,   0, 255, 255];

    const textureData = new Uint8Array([
        b, r, r, r, r,
        r, y, y, y, r,
        r, y, r, r, r,
        r, y, y, r, r,
        r, y, r, r, r,
        r, y, r, r, r,
        r, r, r, r, r
    ].flat());

    const texture = device.createTexture({
        format: 'rgba8unorm',
        size: [width, height],
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    });

    device.queue.writeTexture(
        { texture },
        textureData,
        { bytesPerRow: width * 4 },
        { width, height }
    );

    Renderer.SetBindGroups(
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                device.createSampler(),
                texture.createView()
            ])
        )
    );

    function render()
    {
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;
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
