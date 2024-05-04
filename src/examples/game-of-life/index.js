/**
 * @example Game Of Life
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by Google Codelabs "Your first WebGPU app"
 * {@link https://codelabs.developers.google.com/your-first-webgpu-app}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.3
 * @license MIT
 */

import { UWAL } from "@/index";
import Render from "./Render.wgsl";
import Compute from "./Compute.wgsl";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;
    /** @type {InstanceType<Awaited<ReturnType<UWAL.ComputePipeline>>>} */ let Computation;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Game Of Life Render"));
        Computation = new (await UWAL.ComputePipeline("Game Of Life Compute"));
    }
    catch (error)
    {
        alert(error);
    }

    let uniformBuffer, storageBufferIn, storageBufferOut;
    let INSTANCES, step = 0, lastRender = performance.now();
    const bindGroups = [], WORKGROUP_SIZE = 8, RENDER_LOOP_INTERVAL = 250;

    const renderDescriptor = Renderer.CreateRenderPassDescriptor(
        Renderer.CreateColorAttachment(undefined, "clear", "store", [0, 0, 0.4, 1])
    );

    const bindGroupLayout = Computation.CreateBindGroupLayout([{
        buffer: { type: 'uniform' },
        visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT
    }, {
        buffer: { type: 'read-only-storage' },
        visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX
    }, {
        buffer: { type: 'storage' },
        visibility: GPUShaderStage.COMPUTE
    }]);

    const pipelineLayout = Computation.CreatePipelineLayout(bindGroupLayout);

    const renderModule = Renderer.CreateShaderModule(Render);
    const fragment = Renderer.CreateFragmentState(renderModule);

    const vertex = Renderer.CreateVertexState(renderModule, "vertex", {
        attributes: [Renderer.CreateVertexBufferAttribute("float32x2")],
        arrayStride: 8
    });

    const renderPipeline = Renderer.CreateRenderPipeline({
        layout: pipelineLayout, vertex, fragment
    });

    const computeModule = Computation.CreateShaderModule(Compute);

    const computePipeline = Computation.CreateComputePipeline({
        layout: pipelineLayout, module: computeModule
    });

    const vertices = new Float32Array([
        //  X     Y
         -0.8, -0.8, //     4_____ 2, 3
          0.8, -0.8, //     |    /|
          0.8,  0.8, //     |   / |
          0.8,  0.8, //     |  /  |
         -0.8,  0.8, //     | /   |
         -0.8, -0.8  // 0, 5|/____|1
    ]);

    const VERTICES = vertices.length / 2;

    const vertexBuffer = Renderer.CreateBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    Renderer.WriteBuffer(vertexBuffer, vertices);
    Renderer.SetVertexBuffers(vertexBuffer);

    function clean()
    {
        cancelAnimationFrame(raf);
        bindGroups.splice(step = 0);
        lastRender = performance.now();

        [uniformBuffer, storageBufferIn, storageBufferOut]
            .forEach(buffer => buffer?.destroy());
    }

    function start(size = 48)
    {
        const ratio = UWAL.AspectRatio;
        const { width, height } = UWAL.Canvas;

        const uniformArray = width < height
            ? new Float32Array([size, Math.round(size / ratio)])
            : new Float32Array([Math.round(size * ratio), size]);

        uniformBuffer = Renderer.CreateBuffer({
            size: uniformArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        Renderer.WriteBuffer(uniformBuffer, uniformArray);

        INSTANCES = uniformArray[0] * uniformArray[1];
        const storageArray = new Uint32Array(INSTANCES);

        storageBufferIn = Computation.CreateBuffer({
            size: storageArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        storageBufferOut = Computation.CreateBuffer({
            size: storageArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        for (let s = 0; s < storageArray.length; s++)
            storageArray[s] = +(Math.random() > 0.6);

        Computation.WriteBuffer(storageBufferIn, storageArray);

        Computation.Workgroups = [
            Math.ceil(uniformArray[0] / WORKGROUP_SIZE),
            Math.ceil(uniformArray[1] / WORKGROUP_SIZE)
        ];

        bindGroups.push(
            Computation.CreateBindGroup(
                Computation.CreateBindGroupEntries([
                    { buffer: uniformBuffer },
                    { buffer: storageBufferIn },
                    { buffer: storageBufferOut }
                ]), bindGroupLayout
            ),

            Computation.CreateBindGroup(
                Computation.CreateBindGroupEntries([
                    { buffer: uniformBuffer },
                    { buffer: storageBufferOut },
                    { buffer: storageBufferIn }
                ]), bindGroupLayout
            )
        );

        raf = requestAnimationFrame(render);
    }

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        raf = requestAnimationFrame(render);
        if (time - lastRender < RENDER_LOOP_INTERVAL) return;

        const encoder = Computation.CreateCommandEncoder();
        Computation.SetBindGroups(bindGroups[step % 2]);
        Computation.Compute(computePipeline);

        Renderer.SetCommandEncoder(encoder);
        Renderer.SetBindGroups(bindGroups[++step % 2]);

        renderDescriptor.colorAttachments[0].view = UWAL.CurrentTextureView;
        Renderer.Render(renderDescriptor, renderPipeline, [VERTICES, INSTANCES]);

        lastRender = time;
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            UWAL.SetCanvasSize(inlineSize, blockSize);
        }

        clean(), start();
    });

    observer.observe(canvas);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    UWAL.Destroy();
}
