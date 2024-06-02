/**
 * @module Mipmap Filter
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures.html#mipmapfilter}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { createBlendedMipmap, createCheckedMipmap } from "../textures/mipmaps";
import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import MipmapFilter from "./MipmapFilter.wgsl";
import { vec2, mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Mipmap Filter"));
    }
    catch (error)
    {
        alert(error);
    }

    const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
        undefined, "clear", "store", new Color(0x4c4c4c).rgba
    ));

    Renderer.CreatePipeline({ module: Renderer.CreateShaderModule([Shaders.Quad, MipmapFilter]) });

    const Texture = new (await UWAL.Texture());

    let bindGroupIndex = 0;
    const matrixOffset = 0;
    const objectInfos = [];

    const textures = [
        createTextureWithMipmaps(createBlendedMipmap(), "Blended"),
        createTextureWithMipmaps(createCheckedMipmap(), "Checked")
    ];

    for (let i = 0; i < 8; i++)
    {
        const sampler = Texture.CreateSampler({
            addressModeU: TEXTURE.ADDRESS.REPEAT,
            addressModeV: TEXTURE.ADDRESS.REPEAT,
            magFilter:    (i & 1) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            minFilter:    (i & 2) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            mipmapFilter: (i & 4) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST
        });

        const matrixBufferSize = 16 * Float32Array.BYTES_PER_ELEMENT;

        const matrixBuffer = Renderer.CreateBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: matrixBufferSize
        });

        const matrixValues = new Float32Array(matrixBufferSize / Float32Array.BYTES_PER_ELEMENT);
        const matrix = matrixValues.subarray(matrixOffset, 16);

        Renderer.AddBindGroups(textures.map(texture =>
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    sampler,
                    texture.createView(),
                    { buffer: matrixBuffer }
                ])
            )
        ));

        objectInfos.push({ matrixBuffer, matrixValues, matrix });
    }

    const near = 1;
    const far = 2000;

    const up = [0, 1, 0];
    const target = [0, 0, 0];

    const fov = 60 * Math.PI / 180;
    const cameraPosition = [0, 0, 2];
    const spacing = vec2.set(1.2, 0.7);

    const projectionMatrix = mat4.perspective(fov, Renderer.AspectRatio, near, far);
    const viewMatrix = mat4.inverse(mat4.lookAt(cameraPosition, target, up));
    const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);

    /**
     * @typedef {Object} Mipmap
     * @property {Uint8Array} data
     * @property {number} height
     * @property {number} width
     *
     * @param {(Mipmap | ImageData)[]} mipmaps
     * @param {string} label
     */
    function createTextureWithMipmaps(mipmaps, label)
    {
        const texture = Texture.CreateTexture({
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            size: [mipmaps[0].width, mipmaps[0].height],
            mipLevelCount: mipmaps.length,
            label: `${label} Texture`,
            format: "rgba8unorm"
        });

        mipmaps.forEach(({ data, width, height }, mipLevel) =>
            Texture.WriteTexture(data, {
                bytesPerRow: width * 4,
                texture, mipLevel,
                width, height
            }));

        return texture;
    }

    function render()
    {
        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        objectInfos.forEach(({ matrix, matrixBuffer, matrixValues }, o) =>
        {
            const depth = 50;
            const x = o % 4 - 1.5;
            const y = +(o < 4) * 2 - 1;

            const v = [x * spacing[0], y * spacing[1], -depth * 0.5];
            mat4.translate(viewProjectionMatrix, v, matrix);

            mat4.rotateX(matrix, 0.5 * Math.PI, matrix);
            mat4.scale(matrix, [1, depth * 2, 1], matrix);
            mat4.translate(matrix, [-0.5, -0.5, 0], matrix);

            Renderer.SetActiveBindGroups(o * 2 + bindGroupIndex);
            Renderer.WriteBuffer(matrixBuffer, matrixValues);
            Renderer.Render(6, false);
        });

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        mat4.perspective(fov, Renderer.AspectRatio, near, far, projectionMatrix);
        mat4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);

        render();
    });

    observer.observe(canvas);

    canvas.addEventListener("click", () =>
    {
        bindGroupIndex = (bindGroupIndex + 1) % textures.length;
        render();
    });
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
