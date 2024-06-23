/**
 * @module GPU Mipmaps
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html#generating-mips-on-the-gpu}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import Granite from "~/assets/granite.jpeg";
import GPUMipmaps from "./GPUMipmaps.wgsl";
import GPUMipmap from "./GPUMipmap.wgsl";
import { vec2, mat4 } from "wgpu-matrix";
import Coins from "~/assets/coins.jpg";
import F from "~/assets/f.png";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "GPU Mipmaps"));
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
                    texture.createView({ baseMipLevel, mipLevelCount: 1 }), "clear"
                ));

                Renderer.Render(6);
            }
        };
    })();

    /** @param {string} url */
    const loadImageBitmap = async url =>
        await Texture.CreateBitmapImage(
            await (await fetch(url)).blob(),
            { colorSpaceConversion: "none" }
        );

    const Texture = new (await UWAL.Texture());

    const textures = await Promise.all([
        createTextureFromImage(F, { mipmaps: true }),
        createTextureFromImage(Coins, { mipmaps: true }),
        createTextureFromImage(Granite, { mipmaps: true })
    ]);

    let bindGroupIndex = 0;
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

    Renderer.CreatePipeline({ module: Renderer.CreateShaderModule([Shaders.Quad, GPUMipmaps]) });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    Renderer.ClearBindGroups();

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

    /**
     * @param {ImageBitmap} source
     * @param {{ mipmaps?: boolean; flip?: boolean }} [options]
     */
    function createTextureFromSource(source, { mipmaps, flip } = {})
    {
        const texture = Texture.CopyImageToTexture(source, {
            flipY: flip,
            create: {
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST,
                format: "rgba8unorm",
                mipmaps
            }
        });

        texture.mipLevelCount > 1 && generateMipmaps(texture);
        return texture;
    }

    /**
     * @param {string} url
     * @param {{ mipmaps?: boolean; flip?: boolean }} [options]
     */
    async function createTextureFromImage(url, options)
    {
        const source = await loadImageBitmap(url);
        return createTextureFromSource(source, options);
    }

    function render()
    {
        objectInfos.forEach(({ matrix, matrixBuffer, matrixValues }, o) =>
        {
            const depth = 50;
            const x = o % 4 - 1.5;
            const y = +(o < 4) * 2 - 1;

            const activeGroup = o * textures.length + bindGroupIndex;
            const v = [x * spacing[0], y * spacing[1], -depth * 0.5];
            mat4.translate(viewProjectionMatrix, v, matrix);

            mat4.rotateX(matrix, Math.PI * 0.5, matrix);
            mat4.scale(matrix, [1, depth * 2, 1], matrix);
            mat4.translate(matrix, [-0.5, -0.5, 0], matrix);

            Renderer.WriteBuffer(matrixBuffer, matrixValues);
            Renderer.SetActiveBindGroups(activeGroup);
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
