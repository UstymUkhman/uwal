/**
 * @module Fundamentals
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Fundamentals
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-fundamentals.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.3
 * @license MIT
 */

import { UWAL } from "@/index";
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

        const descriptor = Renderer.CreateRenderPassDescriptor(
            Renderer.CreateColorAttachment(
                undefined,
                "clear",
                "store",
                [0.3, 0.3, 0.3, 1]
            )
        );

        const module = Renderer.CreateShaderModule(RedTriangle);

        const pipeline = Renderer.CreateRenderPipeline({
            vertex: Renderer.CreateVertexState(module),
            fragment: Renderer.CreateFragmentState(module)
        });

        function render()
        {
            UWAL.SetCanvasSize(canvas.width, canvas.height);

            descriptor.colorAttachments[0].view = UWAL.CurrentTextureView;
            Renderer.Render(descriptor, pipeline, 3);
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
        const pipeline = Computation.CreateComputePipeline({ module });

        const bindGroup = Computation.CreateBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: Computation.CreateBindGroupEntries({ buffer: computeBuffer })
        });

        const descriptor = Computation.CreateComputePassDescriptor();

        Computation.SetBindGroups(bindGroup);
        Computation.CreateCommandEncoder();

        Computation.Workgroups = input.length;
        Computation.Compute(pipeline, descriptor);

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
