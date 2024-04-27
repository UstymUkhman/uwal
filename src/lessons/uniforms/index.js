/**
 * @module Uniforms
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Uniforms
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future releases thanks to new library APIs.
 * @version 0.0.2
 * @license MIT
 */

import UWAL from "@/UWAL";
import TriangleUniforms from "./TriangleUniforms.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Triangle Uniforms Encoder"));
    }
    catch (error)
    {
        alert(error);
    }

    const colorAttachment = Renderer.CreateColorAttachment(
        undefined,
        "clear",
        "store",
        [0.3, 0.3, 0.3, 1]
    );

    const descriptor = Renderer.CreateRenderPassDescriptor(
        [colorAttachment],
        "Triangle Uniforms Render Pass"
    );

    const module = Renderer.CreateShaderModule(TriangleUniforms, "Triangle Shader Uniforms");
    const vertex = Renderer.CreateVertexState(module);
    const fragment = Renderer.CreateFragmentState(module);

    const pipeline = Renderer.CreateRenderPipeline({
        label: "Triangle Uniforms Pipeline", vertex, fragment
    });

    const colorOffset = 0;
    const offsetOffset = 4;

    const constUniformBufferSize =
        4 * Float32Array.BYTES_PER_ELEMENT + // Color  - 4 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT + // Offset - 2 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT;  // Padding

    const scaleOffset = 0;

    const varUniformBufferSize =
        2 * Float32Array.BYTES_PER_ELEMENT;  // Scale - 2 32bit floats

    const objectCount = 100;
    const objectInfos = [];

    for (let o = 0; o < objectCount; ++o)
    {
        const constUniformBuffer = Renderer.CreateBuffer({
            label: `Constant Uniform Object[${o}]`,
            size: constUniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Write constant uniforms to the GPUBuffer:
        {
            const uniformValues = new Float32Array(constUniformBufferSize / Float32Array.BYTES_PER_ELEMENT);

            uniformValues.set([random(), random(), random(), 1], colorOffset);
            uniformValues.set([random(-0.9, 0.9), random(-0.9, 0.9)], offsetOffset);

            Renderer.WriteBuffer(constUniformBuffer, uniformValues);
        }

        const uniformValues = new Float32Array(varUniformBufferSize / Float32Array.BYTES_PER_ELEMENT);

        const varUniformBuffer = Renderer.CreateBuffer({
            label: `Variable Uniform Object[${o}]`,
            size: varUniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const entries = Renderer.CreateBindGroupEntries([
            { buffer: constUniformBuffer },
            { buffer: varUniformBuffer }
        ]);

        const bindGroup = Renderer.CreateBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            label: "Uniform Buffer Bind Group",
            entries
        });

        objectInfos.push({
            uniformBuffer: varUniformBuffer,
            scale: random(0.2, 0.5),
            uniformValues,
            bindGroup
        });
    }

    function random(min = 0, max = 1)
    {
        if (max === undefined)
        {
            max = min;
            min = 0;
        }

        return Math.random() * (max - min) + min;
    }

    function render()
    {
        UWAL.SetCanvasSize(canvas.width, canvas.height);

        const aspect = UWAL.AspectRatio;

        descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;

        for (const [o, { scale, bindGroup, uniformBuffer, uniformValues }] of objectInfos.entries())
        {
            uniformValues.set([scale / aspect, scale], scaleOffset);

            Renderer.AddBindGroups(bindGroup);
            Renderer.WriteBuffer(uniformBuffer, uniformValues);
            Renderer.Render(descriptor, pipeline, 3, o === objectInfos.length - 1);
        }
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            UWAL.SetCanvasSize(inlineSize, blockSize);
        }

        render();
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
