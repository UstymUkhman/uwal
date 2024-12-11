/**
 * @module Uniforms
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Uniforms
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-uniforms.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL } from "@/index";
import TriangleUniforms from "./TriangleUniforms.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Triangle Uniforms"));
    }
    catch (error)
    {
        alert(error);
    }

    const colorOffset = 0;
    const offsetOffset = 4;

    const scaleOffset = 0;

    const objectCount = 100;
    const objectInfos = [];

    const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
        undefined, "clear", "store", [0.3, 0.3, 0.3, 1]
    ));

    const module = Renderer.CreateShaderModule(TriangleUniforms);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module),
        fragment: Renderer.CreateFragmentState(module)
    });

    const constUniformBufferSize =
        4 * Float32Array.BYTES_PER_ELEMENT + // Color  - 4 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT + // Offset - 2 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT;  // Padding

    const varUniformBufferSize =
        2 * Float32Array.BYTES_PER_ELEMENT;  // Scale - 2 32bit floats

    for (let o = 0; o < objectCount; ++o)
    {
        const constUniformBuffer = Renderer.CreateBuffer({
            label: `Triangle Uniforms Constant Buffer[${o}]`,
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
            label: `Triangle Uniforms Variable Buffer[${o}]`,
            size: varUniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const bindGroup = Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                { buffer: constUniformBuffer },
                { buffer: varUniformBuffer }
            ])
        );

        objectInfos.push({
            uniformBuffer: varUniformBuffer,
            scale: random(0.2, 0.5),
            uniformValues,
            bindGroup
        });
    }

    /**
     * @param {number} [min]
     * @param {number} [max]
     */
    function random(min, max)
    {
             if (min === undefined) { min = 0;   max = 1; }
        else if (max === undefined) { max = min; min = 0; }

        return Math.random() * (max - min) + min;
    }

    function render()
    {
        Renderer.SetCanvasSize(canvas.width, canvas.height);

        const aspect = Renderer.AspectRatio;

        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        for (const { scale, bindGroup, uniformBuffer, uniformValues } of objectInfos.values())
        {
            uniformValues.set([scale / aspect, scale], scaleOffset);

            Renderer.SetBindGroups(bindGroup);
            Renderer.WriteBuffer(uniformBuffer, uniformValues);
            Renderer.Render(3, false);
        }

        Renderer.Submit();
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

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
