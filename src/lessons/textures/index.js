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
    const height = 7;

    const settings = {
        addressModeU: 'repeat',
        addressModeV: 'repeat',
        magFilter: 'linear',
    };

    const addressOptions = ['repeat', 'clamp-to-edge'];
    const filterOptions = ['nearest', 'linear'];

    const gui = new GUI();
    gui.onChange(render);

    gui.add(settings, 'addressModeU', addressOptions);
    gui.add(settings, 'addressModeV', addressOptions);
    gui.add(settings, 'magFilter', filterOptions);

    Object.assign(gui.domElement.style, {
        right: 'auto', left: '15px'
    });

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

    for (let s = 0; s < 8; s++)
    {
        const sampler = device.createSampler({
            addressModeU: (s & 1) ? 'repeat' : 'clamp-to-edge',
            addressModeV: (s & 2) ? 'repeat' : 'clamp-to-edge',
            magFilter:    (s & 4) ? 'linear' : 'nearest',
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
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        const bindGroup = +(settings.addressModeU === 'repeat') * 1 +
                          +(settings.addressModeV === 'repeat') * 2 +
                          +(settings.magFilter    === 'linear') * 4;

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
