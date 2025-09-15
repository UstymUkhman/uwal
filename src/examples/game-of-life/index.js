/**
 * @example Game Of Life
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by Google Codelabs "Your first WebGPU app"
 * {@link https://codelabs.developers.google.com/your-first-webgpu-app}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import { Device, Color } from "#/index";
import Compute from "./Compute.wgsl";
import Render from "./Render.wgsl";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {Computation} */ let Computation;
/** @type {ResizeObserver} */ let observer;
/** @type {GPUBuffer[]} */ const buffers = [];

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Game Of Life Renderer"));
        Computation = new (await Device.Computation("Game Of Life Computation"));
    }
    catch (error)
    {
        alert(error);
    }

    const RenderPipeline = new Renderer.Pipeline();
    const ComputePipeline = new Computation.Pipeline();

    const WORKGROUP_SIZE = 8, RENDER_LOOP_INTERVAL = 200;
    let step = 0, lastRender = performance.now() - RENDER_LOOP_INTERVAL;
    const computeVertex = GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX;

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(new Color(0x000066)));

    const layout = ComputePipeline.CreatePipelineLayout(ComputePipeline.CreateBindGroupLayout([
        Computation.CreateBufferBindingLayout("uniform", false, 0, computeVertex | GPUShaderStage.FRAGMENT),
        Computation.CreateBufferBindingLayout("read-only-storage", false, 0, computeVertex),
        Computation.CreateBufferBindingLayout("storage")
    ]));

    const renderModule = RenderPipeline.CreateShaderModule(Render);

    await Computation.AddPipeline(ComputePipeline, { layout,
        module: ComputePipeline.CreateShaderModule(Compute)
    });

    const { layout: vertexLayout, buffer: vertexBuffer } =
        RenderPipeline.CreateVertexBuffer("position", 6);

    await Renderer.AddPipeline(RenderPipeline, { layout,
        fragment: RenderPipeline.CreateFragmentState(renderModule),
        vertex: RenderPipeline.CreateVertexState(renderModule, vertexLayout)
    });

    RenderPipeline.WriteBuffer(vertexBuffer, new Float32Array([
         -0.8, -0.8, //     4_____ 2, 3
          0.8, -0.8, //     |    /|
          0.8,  0.8, //     |   / |
          0.8,  0.8, //     |  /  |
         -0.8,  0.8, //     | /   |
         -0.8, -0.8  // 0, 5|/____|1
    ]));

    RenderPipeline.SetVertexBuffers(vertexBuffer);

    function clean()
    {
        cancelAnimationFrame(raf);
        buffers.forEach(buffer => buffer?.destroy());
        lastRender = performance.now() - RENDER_LOOP_INTERVAL;
    }

    function start(size = 48)
    {
        const ratio = Renderer.AspectRatio;
        const [width, height] = Renderer.CanvasSize;

        const { grid, buffer: bufferGrid } =
            RenderPipeline.CreateUniformBuffer("grid");

        grid.set(width < height
            ? [size, Math.round(size / ratio)]
            : [Math.round(size * ratio), size]
        );

        const length = grid[0] * grid[1];
        RenderPipeline.WriteBuffer(bufferGrid, grid);

        const { cellStateIn, buffer: bufferIn } =
            ComputePipeline.CreateStorageBuffer("cellStateIn", length);

        const { buffer: bufferOut } =
            ComputePipeline.CreateStorageBuffer("cellStateOut", length);

        for (let s = 0; s < cellStateIn.length; s++)
            cellStateIn[s] = +(Math.random() > 0.6);

        ComputePipeline.WriteBuffer(bufferOut, cellStateIn);
        ComputePipeline.WriteBuffer(bufferIn, cellStateIn);

        buffers.push(bufferGrid, bufferIn, bufferOut);

        Computation.Workgroups = [
            Math.ceil(grid[0] / WORKGROUP_SIZE),
            Math.ceil(grid[1] / WORKGROUP_SIZE)
        ];

        const bindGroups = [
            ComputePipeline.CreateBindGroup(
                ComputePipeline.CreateBindGroupEntries([
                    bufferGrid, bufferIn, bufferOut
                ])
            ),

            ComputePipeline.CreateBindGroup(
                ComputePipeline.CreateBindGroupEntries([
                    bufferGrid, bufferOut, bufferIn
                ])
            )
        ];

        ComputePipeline.SetBindGroups(bindGroups);
        RenderPipeline.SetBindGroups(bindGroups);

        RenderPipeline.SetDrawParams(6, length);
        raf = requestAnimationFrame(render);
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        if (time - lastRender < RENDER_LOOP_INTERVAL) return;

        const encoder = Computation.CreateCommandEncoder();
        ComputePipeline.SetActiveBindGroups(step % 2);
        Computation.Compute(false);

        Renderer.CommandEncoder = encoder;
        RenderPipeline.SetActiveBindGroups(++step % 2);

        Renderer.Render();
        lastRender = time;
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    Computation.Destroy();
    observer.disconnect();
    Renderer.Destroy();
    Device.Destroy(buffers);
}
