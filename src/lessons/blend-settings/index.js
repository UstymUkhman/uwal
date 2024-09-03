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

import { UWAL, Shaders, TEXTURE, BLEND_STATE } from "@/index";
import Blending from "./Blending.wgsl";
import { mat4 } from "wgpu-matrix";

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
    function createSourceImage(size)
    {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const context = canvas.getContext("2d");
        context.translate(size / 2, size / 2);

        context.globalCompositeOperation = "screen";
        const PI2 = Math.PI * 2, numCircles = 3;

        for (let i = 0; i < numCircles; ++i)
        {
            context.rotate(PI2 / numCircles);
            context.save();
            context.translate(size / 6, 0);
            context.beginPath();

            const radius = size / 3;
            const h = i / numCircles;
            context.arc(0, 0, radius, 0, PI2);

            const gradient = context.createRadialGradient(0, 0, radius / 2, 0, 0, radius);
            gradient.addColorStop(0.5, hsla(h, 1, 0.5, 1));
            gradient.addColorStop(1, hsla(h, 1, 0.5, 0));

            context.fillStyle = gradient;
            context.fill();
            context.restore();
        }

        canvas.style.position = "absolute";
        canvas.style.height = `${size}px`;
        canvas.style.width = `${size}px`;
        canvas.style.left = "8px";
        canvas.style.top = "8px";

        return canvas;
    }

    /** @param {number} size */
    function createDestinationImage(size)
    {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        const context = canvas.getContext("2d");
        const gradient = context.createLinearGradient(0, 0, size, size);

        for (let i = 0; i <= 6; ++i)
          gradient.addColorStop(i / 6, hsl(i / -6, 1, 0.5));

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        context.fillStyle = "rgba(0, 0, 0, 255)";
        context.globalCompositeOperation = "destination-out";
        context.rotate(Math.PI / -4);

        for (let i = 0; i < size * 2; i += 32)
          context.fillRect(-size, i, size * 2, 16);

        canvas.style.position = "absolute";
        canvas.style.height = `${size}px`;
        canvas.style.width = `${size}px`;
        canvas.style.left = "8px";
        canvas.style.top = "8px";

        return canvas;
    }

    function createMatrixUniformBuffer()
    {
        const { values } = /** @type {Record<String, Float32Array>} */ (
            Renderer.CreateUniformBufferLayout("matrix")
        );

        const buffer = Renderer.CreateBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: values.buffer.byteLength
        });

        return { values, buffer };
    }

    /**
     * @param {HTMLCanvasElement} source
     * @param {boolean} [premultipliedAlpha]
     */
    function createTextureFromSource(source, premultipliedAlpha = true)
    {
        return Texture.CopyImageToTexture(source, {
            premultipliedAlpha,
            create: {
                usage:
                    GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_DST,
                format: "rgba8unorm",
                mipmaps: false
            }
        });
    }

    /** @param {string | number | number[]} value */
    function setBlendConstant(value)
    {
        const factors = ["constant", "one-minus-constant"];
        if (typeof value === "string" && !factors.includes(value)) return;
        Renderer.BlendConstant = [...constant.color, constant.alpha];
    }

    function setClearColor()
    {
        const { premultiply, alpha, color } = clear;
        const a = premultiply && alpha || 1;
        const [r, g, b] = color;

        background.clearValue[0] = r * a;
        background.clearValue[1] = g * a;
        background.clearValue[2] = b * a;
        background.clearValue[3] = alpha;
    }

    /** @param {GPUBlendComponent} blend */
    function checkBlendComponentValues(blend)
    {
        const { operation } = blend;

        if (operation === "min" || operation === "max")
            blend.srcFactor = blend.dstFactor = "one";
    }

    /**
     * @param {{ values: Float32Array, buffer: GPUBuffer }} uniform
     * @param {GPUTexture} canvas
     * @param {GPUTexture} texture
     */
    function updateMatrixUniform(uniform, canvas, texture)
    {
        const projectionMatrix = mat4.ortho(0, canvas.width, canvas.height, 0, -1, 1);
        mat4.scale(projectionMatrix, [texture.width, texture.height, 1], uniform.values);
        Renderer.WriteBuffer(uniform.buffer, uniform.values);
    }

    const Texture = new (await UWAL.Texture(Renderer));
    const module = Renderer.CreateShaderModule([Shaders.Quad, Blending]);
    const sampler = Texture.CreateSampler({ filter: TEXTURE.FILTER.LINEAR });

    const sourceImage = createSourceImage(300);
    const destinationImage = createDestinationImage(300);
    const sourceUniform = createMatrixUniformBuffer();
    const destinationUniform = createMatrixUniformBuffer();

    const sourceTexturePremultipliedAlpha = createTextureFromSource(sourceImage);
    const destinationTexturePremultipliedAlpha = createTextureFromSource(destinationImage);
    const sourceTextureUnpremultipliedAlpha = createTextureFromSource(sourceImage, false);
    const destinationTextureUnpremultipliedAlpha = createTextureFromSource(destinationImage, false);

    const bindGroupLayout = Renderer.CreateBindGroupLayout([
        { visibility: GPUShaderStage.FRAGMENT, sampler: { } },
        { visibility: GPUShaderStage.VERTEX, buffer: { } },
        { visibility: GPUShaderStage.FRAGMENT, texture: { } }
    ]);

    Renderer.SetBindGroups([
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                sampler,
                { buffer: sourceUniform.buffer },
                sourceTexturePremultipliedAlpha.createView()
            ]),
            bindGroupLayout
        ),

        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                sampler,
                { buffer: destinationUniform.buffer },
                destinationTexturePremultipliedAlpha.createView()
            ]),
            bindGroupLayout
        ),

        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                sampler,
                { buffer: sourceUniform.buffer },
                sourceTextureUnpremultipliedAlpha.createView()
            ]),
            bindGroupLayout
        ),

        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                sampler,
                { buffer: destinationUniform.buffer },
                destinationTextureUnpremultipliedAlpha.createView()
            ]),
            bindGroupLayout
        )
    ]);

    const textureSets = [{
        sourceBindGroup: 0,
        destinationBindGroup: 1,
        sourceTexture: sourceTexturePremultipliedAlpha,
        destinationTexture: destinationTexturePremultipliedAlpha
    }, {
        sourceBindGroup: 2,
        destinationBindGroup: 3,
        sourceTexture: sourceTextureUnpremultipliedAlpha,
        destinationTexture: destinationTextureUnpremultipliedAlpha
    }];

    const gui = new GUI().onChange(render);
    const settings = { textureSet: 0, alphaMode: "premultiplied", preset: "Copy (Default)" };

    gui.add(settings, "alphaMode", ["opaque", "premultiplied"]).name("Canvas Alpha Mode")
        .onChange((/** @type {GPUCanvasAlphaMode} */ alphaMode) => Renderer.ConfigureContext({ alphaMode }));

    gui.add(settings, "textureSet", ["premultiplied alpha", "un-premultiplied alpha"]).name("Texture Set");

    const unPremultipliedColor = Renderer.CreateBlendComponent("add", "src-alpha", "one-minus-src-alpha");
    const unPremultipliedAlpha = Renderer.CreateBlendComponent("add", "src-alpha", "one-minus-src-alpha");

    const presets = {
        "Copy (Default)": BLEND_STATE.COPY,
        "Additive (Lighten)": BLEND_STATE.ADDITIVE,
        "Un-premultiplied Blend": { color: unPremultipliedColor, alpha: unPremultipliedAlpha },
        "Source Over (Premultiplied Blend)": BLEND_STATE.SOURCE_OVER,
        "Destination Over": BLEND_STATE.DESTINATION_OVER,
        "Source In": BLEND_STATE.SOURCE_IN,
        "Destination In": BLEND_STATE.DESTINATION_IN,
        "Source Out": BLEND_STATE.SOURCE_OUT,
        "Destination Out": BLEND_STATE.DESTINATION_OUT,
        "Source Atop": BLEND_STATE.SOURCE_ATOP,
        "Destination Atop": BLEND_STATE.DESTINATION_ATOP
    };

    gui.add(settings, "preset", Object.keys(presets)).name("Blending Preset")
        .onChange((/** @type {string} */ preset) =>
        {
            const blending = presets[preset];
            Object.assign(color, blending.color);
            Object.assign(alpha, blending.alpha);
        });

    const colorFolder = gui.addFolder("Color");
    const color = Renderer.CreateBlendComponent();
    const operations = ["add", "subtract", "reverse-subtract", "min", "max"];

    const factors = [
        "zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst",
        "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"
    ];

    colorFolder.add(color, "operation", operations).name("Operation");
    colorFolder.add(color, "srcFactor", factors).name("Source Factor").onChange(setBlendConstant);
    colorFolder.add(color, "dstFactor", factors).name("Destination Factor").onChange(setBlendConstant);

    const alphaFolder = gui.addFolder("Alpha");
    const alpha = Renderer.CreateBlendComponent();
    alphaFolder.add(alpha, "operation", operations).name("Operation");
    alphaFolder.add(alpha, "srcFactor", factors).name("Source Factor").onChange(setBlendConstant);
    alphaFolder.add(alpha, "dstFactor", factors).name("Destination Factor").onChange(setBlendConstant);

    const constantFolder = gui.addFolder("Constant");
    const constant = { color: [1, 0.5, 0.25], alpha: 1 };
    constantFolder.addColor(constant, "color").name("Color").onChange(setBlendConstant);
    constantFolder.add(constant, "alpha", 0, 1).name("Alpha").onChange(setBlendConstant);

    const clearFolder = gui.addFolder("Canvas Clear Color");
    const clear = { color: [0, 0, 0], alpha: 0, premultiply: true };
    clearFolder.addColor(clear, "color").name("Color").onChange(setClearColor);
    clearFolder.add(clear, "alpha", 0, 1).name("Alpha").onChange(setClearColor);
    clearFolder.add(clear, "premultiply").name("Premultiply").onChange(setClearColor);

    const background = Renderer.CreateColorAttachment();
    background.clearValue = [...clear.color, clear.alpha];
    const layout = Renderer.CreatePipelineLayout(bindGroupLayout);

    Renderer.CreatePassDescriptor(background);
    Renderer.CreatePipeline({ module, layout });
    const vertex = Renderer.CreateVertexState(module);

    function render()
    {
        checkBlendComponentValues(color);
        checkBlendComponentValues(alpha);

        gui.updateDisplay();

        const { sourceTexture, destinationTexture, destinationBindGroup, sourceBindGroup } =
            textureSets[settings.textureSet];

        const texture = Renderer.CurrentTexture;
        updateMatrixUniform(sourceUniform, texture, sourceTexture);
        updateMatrixUniform(destinationUniform, texture, destinationTexture);

        // Draw in destination pipeline (no blending):
        Renderer.SetActiveBindGroups(destinationBindGroup);
        Renderer.Render(6, false);
        Renderer.SavePipelineState();

        // Draw in source pipeline (with blending):
        const target = Renderer.CreateTargetState(void 0, { color, alpha });
        const fragment = Renderer.CreateFragmentState(module, void 0, target);

        Renderer.CreatePipeline({ vertex, fragment, layout }, true);
        Renderer.SetActiveBindGroups(sourceBindGroup);
        Renderer.Render(6);

        // Switch back to destination pipeline:
        Renderer.RestorePipelineState();
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
