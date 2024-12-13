/**
 * @module Fundamentals
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Fundamentals
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL } from "#/index";
import RedTriangle from "./RedTriangle.wgsl";
import Double from "./Double.wgsl";

(async function(canvas)
{
    // Drawing triangles to textures:
    {
        /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

        try
        {
            Renderer = new (await UWAL.RenderPipeline(canvas, "Red Triangle"));
        }
        catch (error)
        {
            alert(error);
        }

        const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
            undefined, "clear", "store", [0.3, 0.3, 0.3, 1]
        ));

        const module = Renderer.CreateShaderModule(RedTriangle);

        Renderer.CreatePipeline({
            vertex: Renderer.CreateVertexState(module),
            fragment: Renderer.CreateFragmentState(module)
        });

        function render()
        {
            Renderer.SetCanvasSize(canvas.width, canvas.height);
            descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;
            Renderer.Render(3);
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
    }

    // Run computations on the GPU:
    {
        const input = new Float32Array([1, 3, 5]);

        const Computation = new (await UWAL.ComputePipeline("Double Compute"));

        const computeBuffer = Computation.CreateBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
        });

        Computation.WriteBuffer(computeBuffer, input);

        const module = Computation.CreateShaderModule(Double);
        Computation.CreatePipeline({ module });

        const bindGroup = Computation.CreateBindGroup(
            Computation.CreateBindGroupEntries({ buffer: computeBuffer })
        );

        Computation.CreatePassDescriptor();
        Computation.SetBindGroups(bindGroup);
        Computation.Workgroups = input.length;
        Computation.Compute();

        const resultBuffer = Computation.CreateBuffer({
            size: input.byteLength,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
        });

        Computation.CopyBufferToBuffer(computeBuffer, resultBuffer, resultBuffer.size);
        Computation.SubmitCommandBuffer();

        await resultBuffer.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(resultBuffer.getMappedRange());

        console.info("Input:", ...input);
        console.info("Result:", ...result);

        resultBuffer.unmap();
    }
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
