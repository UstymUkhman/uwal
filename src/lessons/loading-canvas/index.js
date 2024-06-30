/**
 * @module Loading Canvas
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html#loading-canvas}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import GPUMipmaps from "../gpu-mipmaps/GPUMipmaps.wgsl";
import GPUMipmap from "../gpu-mipmaps/GPUMipmap.wgsl";
import { vec2, mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Loading Canvas"));
    }
    catch (error)
    {
        alert(error);
    }

    const generateMipmaps = (() =>
    {
        let module, sampler;

        /** @param {GPUTexture} texture */
        return (texture) =>
        {
            if (!module)
            {
                module = Renderer.CreateShaderModule([Shaders.Quad, GPUMipmap]);
                sampler = Texture.CreateSampler({ minFilter: TEXTURE.FILTER.LINEAR });
            }

            Renderer.CreatePipeline({
                fragment: Renderer.CreateFragmentState(module, "fragment", { format: texture.format }),
                vertex: Renderer.CreateVertexState(module)
            });

            let baseMipLevel = 0;
            let width = texture.width;
            let height = texture.height;

            while (1 < width || 1 < height)
            {
                width = Math.max(width / 2 | 0, 1);
                height = Math.max(height / 2 | 0, 1);

                Renderer.SetBindGroups(
                    Renderer.CreateBindGroup(
                        Renderer.CreateBindGroupEntries([
                            sampler,
                            texture.createView({
                                baseMipLevel: baseMipLevel++,
                                mipLevelCount: 1
                            })
                        ])
                    )
                );

                Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
                    texture.createView({ baseMipLevel, mipLevelCount: 1 })
                ));

                Renderer.Render(6);
            }
        };
    })();

    const size = 256;
    const half = size / 2;

    const matrixOffset = 0;
    const objectInfos = [];

    const near = 1;
    const far = 2000;

    const up = [0, 1, 0];
    const target = [0, 0, 0];

    const fov = Math.PI * 60 / 180;
    const cameraPosition = [0, 0, 2];
    const spacing = vec2.set(1.2, 0.7);

    const projectionMatrix = mat4.perspective(fov, Renderer.AspectRatio, near, far);
    const viewMatrix = mat4.inverse(mat4.lookAt(cameraPosition, target, up));
    const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);

    const context2d = document.createElement("canvas").getContext("2d");
    context2d.canvas.width = context2d.canvas.height = size;

    const Texture = new (await UWAL.Texture());
    const texture = createTextureFromSource(context2d.canvas, { mipmaps: true });

    const pipeline = Renderer.CreatePipeline({
        module: Renderer.CreateShaderModule([Shaders.Quad, GPUMipmaps])
    });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    const descriptor = Renderer.CreatePassDescriptor(colorAttachment);

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

        const bindGroup =
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    sampler,
                    texture.createView(),
                    { buffer: matrixBuffer }
                ])
            );

        objectInfos.push({ matrixBuffer, matrixValues, matrix, bindGroup });
    }

    /**
     * @param {number} h
     * @param {number} s
     * @param {number} l
     */
    const hsl = (h, s, l) => `hsl(${h * 360 | 0}, ${s * 100}%, ${l * 100 | 0}%)`;

    /**
     * @param {HTMLCanvasElement} source
     * @param {{ mipmaps?: boolean; flip?: boolean }} [options]
     */
    function createTextureFromSource(source, { mipmaps, flip } = {})
    {
        const texture = Texture.CreateTextureFromSource(source, {
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,
            format: "rgba8unorm",
            mipmaps
        });

        copySourceToTexture(source, texture, flip);
        return texture;
    }

    /**
     * @param {HTMLCanvasElement} source
     * @param {GPUTexture} texture
     * @param {boolean} [flipY = false]
     */
    function copySourceToTexture(source, texture, flipY = false)
    {
        Texture.CopyImageToTexture(source, { texture, flipY });
        texture.mipLevelCount > 1 && generateMipmaps(texture);
    }

    /** @param {DOMHighResTimeStamp} time */
    function updateCanvas2d(time)
    {
        context2d.clearRect(0, 0, size, size);
        context2d.save();
        context2d.translate(half, half);

        const rects = 20;

        for (let r = 0; r < rects; r++)
        {
            context2d.fillStyle = hsl(r / rects * 0.2 + time * 0.1, 1, r % 2 * 0.5);
            context2d.fillRect(-half, -half, size, size);

            context2d.rotate(time * 0.5);
            context2d.scale(0.85, 0.85);
            context2d.translate(size / 16, 0);
        }

        context2d.restore();
    }

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        updateCanvas2d(time * 1e-4);
        requestAnimationFrame(render);
        copySourceToTexture(context2d.canvas, texture);

        // Using `descriptor.colorAttachments[0].view = undefined` here is an alternative to
        // setting `Renderer.UseCurrentTextureView` to `true` after calling `Renderer.SetPassDescriptor`.
        // `Renderer.UseCurrentTextureView` will be still set to `true` in the `SetPassDescriptor` method,
        // but `descriptor.colorAttachments[0].view` value is cached across render cycles, so we need to reset it
        // at the beginning of each render pass in order to avoid using a destroyed texture in `Renderer.Submit` method.

        Renderer.SetPassDescriptor(descriptor);
        Renderer.UseCurrentTextureView = true;
        Renderer.SetPipeline(pipeline);

        objectInfos.forEach(({ matrix, matrixBuffer, matrixValues, bindGroup }, o) =>
        {
            const depth = 50;
            const x = o % 4 - 1.5;
            const y = +(o < 4) * 2 - 1;

            const v = [x * spacing[0], y * spacing[1], -depth * 0.5];
            mat4.translate(viewProjectionMatrix, v, matrix);

            mat4.rotateX(matrix, Math.PI * 0.5, matrix);
            mat4.scale(matrix, [1, depth * 2, 1], matrix);
            mat4.translate(matrix, [-0.5, -0.5, 0], matrix);

            Renderer.WriteBuffer(matrixBuffer, matrixValues);
            Renderer.SetBindGroups(bindGroup);
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

        requestAnimationFrame(render);
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
