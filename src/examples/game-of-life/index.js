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

    const SIZE = 32, INSTANCES = SIZE * SIZE;
    let step = 0, lastRender = performance.now();
    const WORKGROUP_SIZE = 8, RENDER_LOOP_INTERVAL = 250;

    const uniformArray = new Float32Array([SIZE, SIZE]);

    const uniformBuffer = Renderer.CreateBuffer({
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    Renderer.WriteBuffer(uniformBuffer, uniformArray);

    const storageArray = new Uint32Array(INSTANCES);

    const storageBufferIn = Computation.CreateBuffer({
        size: storageArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    const storageBufferOut = Computation.CreateBuffer({
        size: storageArray.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    for (let s = 0; s < storageArray.length; s++)
        storageArray[s] = +(Math.random() > 0.6);

    Computation.WriteBuffer(storageBufferIn, storageArray);

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

    const bindGroups = [
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
    ];

    const vertices = new Float32Array([
        //  X     Y
         -0.8, -0.8, //     4_____ 2, 3
          0.8, -0.8, //     |    /|
          0.8,  0.8, //     |   / |
          0.8,  0.8, //     |  /  |
         -0.8,  0.8, //     | /   |
         -0.8, -0.8  // 0, 5|/____|1
    ]);

    const vertexBuffer = Renderer.CreateBuffer({
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    Renderer.WriteBuffer(vertexBuffer, vertices);

    const renderModule = Renderer.CreateShaderModule(Render);
    const fragment = Renderer.CreateFragmentState(renderModule);

    const vertex = Renderer.CreateVertexState(renderModule, "vertex", {
        attributes: [Renderer.CreateVertexBufferAttribute("float32x2")],
        arrayStride: 8
    });

    const pipelineLayout = Computation.CreatePipelineLayout(bindGroupLayout);

    const renderPipeline = Renderer.CreateRenderPipeline({
        layout: pipelineLayout, vertex, fragment
    });

    const renderDescriptor = Renderer.CreateRenderPassDescriptor(
        Renderer.CreateColorAttachment(
            undefined, "clear", "store", [0, 0, 0.4, 1]
        )
    );

    const computeModule = Computation.CreateShaderModule(Compute);

    const computePipeline = Computation.CreateComputePipeline({
        layout: pipelineLayout, module: computeModule
    });

    Computation.Workgroups = [
        Math.ceil(SIZE / WORKGROUP_SIZE),
        Math.ceil(SIZE / WORKGROUP_SIZE)
    ];

    const VERTICES = vertices.length / 2;

    Renderer.SetVertexBuffers(vertexBuffer);

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

        raf = requestAnimationFrame(render);
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
