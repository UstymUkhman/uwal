/**
 * @module Bind Group Layouts
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Bind Group Layouts
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-bind-group-layouts.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.9
 * @license MIT
 */

import Double from "../fundamentals/Double.wgsl";
import { UWAL, Shaders, Color } from "@/index";
import DoubleToDst from "./DoubleToDst.wgsl";
import AddThree from "./AddThree.wgsl";
import Shader from "./Texture.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    /** @type {Computation} */ let Computation;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Bind Group Layouts"));
        Computation = new (await UWAL.ComputePipeline(canvas, "Dynamic Offsets"));
    }
    catch (error)
    {
        alert(error);
    }

    // Using a bind group layout different than layout: "auto" - "rgba32float":
    {
        const Texture = new (await UWAL.Texture()), width = 5;
        const colorAttachment = Renderer.CreateColorAttachment();
        colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
        Renderer.CreatePassDescriptor(colorAttachment);

        const sampler = Texture.CreateSampler();

        const texture = Texture.CreateTexture({
            format: "rgba32float",
            size: [width, 7]
        });

        const r = new Color(0xff0000).RGBA;
        const y = new Color(0xffff00).RGBA;
        const b = new Color(0x0000ff).RGBA;

        const textureData = new Float32Array([
            b, r, r, r, r,
            r, y, y, y, r,
            r, y, r, r, r,
            r, y, y, r, r,
            r, y, r, r, r,
            r, y, r, r, r,
            r, r, r, r, r
        ].flat());

        Texture.WriteTexture(textureData, { texture, bytesPerRow: width * 4 * 4 });

        Renderer.CreatePipeline({
            module: Renderer.CreateShaderModule([Shaders.Quad, Shader]),
            layout: Renderer.CreatePipelineLayout(
                Renderer.CreateBindGroupLayout([
                    Renderer.CreateSamplerBindingLayout("non-filtering"),
                    Renderer.CreateTextureBindingLayout("unfilterable-float")
                ])
            )
        });

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    sampler,
                    texture.createView()
                ])
            )
        );
    }

    // Using a bind group layout different than layout: "auto" - dynamic offsets:
    {
        Computation.CreatePipeline({
            module: Computation.CreateShaderModule(DoubleToDst),
            layout: Computation.CreatePipelineLayout(
                Computation.CreateBindGroupLayout(
                    Array.from({ length: 3 }).fill(
                        Computation.CreateBufferBindingLayout("storage", true)
                    )
                )
            )
        });

        const input = new Float32Array(64 * 3);

        input.set([1, 3, 5]);
        input.set([11, 12, 13], 64);

        const computeBuffer = Computation.CreateBuffer({
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            size: input.byteLength
        });

        const resultBuffer = Computation.CreateReadableBuffer(input.byteLength);

        Computation.WriteBuffer(computeBuffer, input);

        Computation.SetBindGroups(
            Computation.CreateBindGroup(
                Computation.CreateBindGroupEntries(
                    Array.from({ length: 3 }).fill({
                        buffer: computeBuffer,
                        size: 256
                    })
                )
            ),
            [0, 256, 512]
        );

        Computation.Workgroups = 3;
        Computation.Compute();

        Computation.CopyBufferToBuffer(computeBuffer, resultBuffer);
        Computation.Submit();

        await resultBuffer.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(resultBuffer.getMappedRange());

        console.log('src0:', input.slice(0, 3));
        console.log('src1:', input.slice(64, 64 + 3));
        console.log('dst:', result.slice(128, 128 + 3));

        resultBuffer.unmap();
    }

    // Using a bind group with more than 1 pipeline:
    {
        const bindGroupLayout = Computation.CreateBindGroupLayout(
            Computation.CreateBufferBindingLayout("storage")
        );

        const pipelineLayout = Computation.CreatePipelineLayout(
            bindGroupLayout
        );

        const addThreePipeline = Computation.CreatePipeline({
            module: Computation.CreateShaderModule(AddThree),
            layout: pipelineLayout
        });

        Computation.CreatePipeline({
            module: Computation.CreateShaderModule(Double),
            layout: pipelineLayout
        });

        const input = new Float32Array([1, 3, 5]);

        const computeBuffer = Computation.CreateBuffer({
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
            size: input.byteLength
        });

        Computation.WriteBuffer(computeBuffer, input);

        const resultBuffer = Computation.CreateReadableBuffer(input.byteLength);

        Computation.SetBindGroups(
            Computation.CreateBindGroup(
                Computation.CreateBindGroupEntries({
                    buffer: computeBuffer
                })
            )
        );

        Computation.Workgroups = input.length;
        Computation.Compute();

        Computation.SetPipeline(addThreePipeline);
        Computation.Compute();

        Computation.CopyBufferToBuffer(computeBuffer, resultBuffer);
        Computation.Submit();

        await resultBuffer.mapAsync(GPUMapMode.READ);
        const result = new Float32Array(resultBuffer.getMappedRange());

        console.log('input:', input);
        console.log('result:', result);

        resultBuffer.unmap();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        Renderer.Render(6);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
