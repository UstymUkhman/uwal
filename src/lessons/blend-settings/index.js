/**
 * @module Blend Settings
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Transparency and Blending
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html#blend-settings}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.7
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import Blending from "./Blending.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    canvas.style.backgroundPosition = "0 0, 0 16px, 16px -16px, -16px 0px";
    canvas.style.backgroundSize     = "32px 32px";
    canvas.style.backgroundColor    = "#404040";
    canvas.style.backgroundImage    = `
        linear-gradient( 45deg,     #808080 25%, transparent 25%),
        linear-gradient(-45deg,     #808080 25%, transparent 25%),
        linear-gradient( 45deg, transparent 75%,     #808080 75%),
        linear-gradient(-45deg, transparent 75%,     #808080 75%)
    `;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(
            canvas, "Blend Settings", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    /**
     * @param {number} h
     * @param {number} s
     * @param {number} l
     */
    const hsl = (h, s, l) => `hsl(${h * 360 | 0}, ${s * 100}%, ${l * 100 | 0}%)`;

    /**
     * @param {number} h
     * @param {number} s
     * @param {number} l
     * @param {number} a
     */
    const hsla = (h, s, l, a) => `hsla${hsl(h, s, l).slice(3, -1)}, ${a})`;

    /** @param {number} size */
    function createDestinationImage(size)
    {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, size, size);

        for (let i = 0; i <= 6; ++i)
          gradient.addColorStop(i / 6, hsl(i / -6, 1, 0.5));

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "rgba(0, 0, 0, 255)";
        ctx.globalCompositeOperation = "destination-out";
        ctx.rotate(Math.PI / -4);

        for (let i = 0; i < size * 2; i += 32)
          ctx.fillRect(-size, i, size * 2, 16);

        return canvas;
    }

    /** @param {number} size */
    function createSourceImage(size)
    {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const ctx = canvas.getContext("2d");
        ctx.translate(size / 2, size / 2);

        ctx.globalCompositeOperation = "screen";
        const PI2 = Math.PI * 2, numCircles = 3;

        for (let i = 0; i < numCircles; ++i)
        {
            ctx.rotate(PI2 / numCircles);
            ctx.save();
            ctx.translate(size / 6, 0);
            ctx.beginPath();

            const radius = size / 3;
            const h = i / numCircles;
            ctx.arc(0, 0, radius, 0, PI2);

            const gradient = ctx.createRadialGradient(0, 0, radius / 2, 0, 0, radius);
            gradient.addColorStop(0.5, hsla(h, 1, 0.5, 1));
            gradient.addColorStop(1, hsla(h, 1, 0.5, 0));

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
        }

        return canvas;
    }

    /**
     * @param {HTMLCanvasElement} source
     * @param {boolean} [premultipliedAlpha]
     */
    function createTextureFromSource(source, premultipliedAlpha = false)
    {
        return Texture.CopyImageToTexture(source, {
            premultipliedAlpha,
            create: {
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST,
                format: "rgba8unorm"
            }
        });
    }

    function createMatrixUniformBuffer()
    {
        const { value } = /** @type {Record<String, Float32Array>} */ (
            /** @type {import("@/pipelines/BasePipeline").UniformLayout} */ (
                Renderer.CreateUniformBufferLayout("matrix")
            )
        );

        const buffer = Renderer.CreateBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: value.buffer.byteLength
        });

        return { value, buffer };
    }

    const size = 300;
    const sourceImage = createSourceImage(size);
    const destinationImage = createDestinationImage(size);

    sourceImage.style.top = "8px";
    sourceImage.style.left = "8px";
    sourceImage.style.width = `${size}px`;
    sourceImage.style.height = `${size}px`;
    sourceImage.style.position = "absolute";

    destinationImage.style.position = "absolute";
    destinationImage.style.height = `${size}px`;
    destinationImage.style.width = `${size}px`;
    destinationImage.style.left = "8px";
    destinationImage.style.top = "8px";

    document.body.appendChild(sourceImage);
    document.body.appendChild(destinationImage);

    const Texture = new (await UWAL.Texture());
    const module = Renderer.CreateShaderModule([Shaders.Quad, Blending]);
    const background = (Texture.Renderer = Renderer).CreateColorAttachment();

    const sourceTextureUnpremultipliedAlpha = createTextureFromSource(sourceImage);
    const destinationTextureUnpremultipliedAlpha = createTextureFromSource(destinationImage);

    const destinationTexturePremultipliedAlpha = createTextureFromSource(destinationImage, true);
    const sourceTexturePremultipliedAlpha = createTextureFromSource(sourceImage, true);

    const sourceUniform = createMatrixUniformBuffer();
    const destinationUniform = createMatrixUniformBuffer();

    const bindGroupLayout = Renderer.CreateBindGroupLayout([
        { visibility: GPUShaderStage.FRAGMENT, sampler: { }, },
        { visibility: GPUShaderStage.VERTEX, buffer: { } },
        { visibility: GPUShaderStage.FRAGMENT, texture: { } }
    ]);

    const layout = Renderer.CreatePipelineLayout(bindGroupLayout);
    const sampler = Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR });

    const sourceBindGroupUnpremultipliedAlpha = Renderer.CreateBindGroup(
        Renderer.CreateBindGroupEntries([
            sampler,
            { buffer: sourceUniform.buffer },
            sourceTextureUnpremultipliedAlpha.createView()
        ]),
        bindGroupLayout
    );

    const destinationBindGroupUnpremultipliedAlpha = Renderer.CreateBindGroup(
        Renderer.CreateBindGroupEntries([
            sampler,
            { buffer: destinationUniform.buffer },
            destinationTextureUnpremultipliedAlpha.createView()
        ]),
        bindGroupLayout
    );

    const sourceBindGroupPremultipliedAlpha = Renderer.CreateBindGroup(
        Renderer.CreateBindGroupEntries([
            sampler,
            { buffer: sourceUniform.buffer },
            sourceTexturePremultipliedAlpha.createView()
        ]),
        bindGroupLayout
    );

    const destinationBindGroupPremultipliedAlpha = Renderer.CreateBindGroup(
        Renderer.CreateBindGroupEntries([
            sampler,
            { buffer: destinationUniform.buffer },
            destinationTexturePremultipliedAlpha.createView()
        ]),
        bindGroupLayout
    );

    const textureSets = [{
        sourceTexture: sourceTexturePremultipliedAlpha,
        destinationTexture: destinationTexturePremultipliedAlpha,
        sourceBindGroup: sourceBindGroupPremultipliedAlpha,
        destinationBindGroup: destinationBindGroupPremultipliedAlpha,
    }, {
        sourceTexture: sourceTextureUnpremultipliedAlpha,
        destinationTexture: destinationTextureUnpremultipliedAlpha,
        sourceBindGroup: sourceBindGroupUnpremultipliedAlpha,
        destinationBindGroup: destinationBindGroupUnpremultipliedAlpha,
    }];

    const clearColor = new Color(0, 0, 0, 0);
    background.clearValue = clearColor.rgba;
    Renderer.CreatePassDescriptor(background);

    const vertex = Renderer.CreateVertexState(module);
    const destinationPipeline = Renderer.CreatePipeline({ module, layout });

    const color = Renderer.CreateBlendComponent(void 0, void 0, "one-minus-src");
    const alpha = Renderer.CreateBlendComponent(void 0, void 0, "one-minus-src");

    function render()
    {
        const target = Renderer.CreateTargetState(void 0, { color, alpha });
        const fragment = Renderer.CreateFragmentState(module, void 0, target);
        const sourcePipeline = Renderer.CreatePipeline({ vertex, fragment, layout });

        Renderer.Render(0);
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
