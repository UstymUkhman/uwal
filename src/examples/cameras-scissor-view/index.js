/**
 * @example Cameras / Scissor View
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import { Device, Shaders } from "#/index";
import Scissor from "./Scissor.wgsl";
import Camera from "./Camera.wgsl";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.RenderPipeline(canvas, "Cameras / Scissor View"));
    }
    catch (error)
    {
        alert(error);
    }

    let texture0, view0, texture1, view1;
    let cameraAttachments, scissorAttachment;
    const Texture = new (await Device.Texture());

    const module = Renderer.CreateShaderModule([
        Shaders.Quad, Camera
    ]);

    const cameraPipeline = Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module),
        fragment: Renderer.CreateFragmentState(module, void 0, [
            Renderer.CreateTargetState(),
            Renderer.CreateTargetState()
        ])
    });

    const scissorPipeline = Renderer.CreatePipeline(
        Renderer.CreateShaderModule([
            Shaders.Quad, Scissor
        ])
    );

    function start()
    {
        const [width, height] = Renderer.CanvasSize;

        texture0 = Texture.CreateTexture({
            format: Device.PreferredCanvasFormat,
            size: [width / 2, height]
        });

        texture1 = Texture.CreateTexture({
            format: Device.PreferredCanvasFormat,
            size: [width / 2, height]
        });

        view0 = texture0.createView();
        view1 = texture1.createView();

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    { buffer: Renderer.ResolutionBuffer },
                    Texture.CreateSampler(),
                    view0, view1
                ])
            )
        );

        cameraAttachments = [
            Renderer.CreateColorAttachment(view0),
            Renderer.CreateColorAttachment(view1)
        ];

        scissorAttachment = Renderer.CreateColorAttachment();

        raf = requestAnimationFrame(render);
    }

    function render()
    {
        raf = requestAnimationFrame(render);

        Renderer.SetPipeline(cameraPipeline);
        Renderer.CreatePassDescriptor(cameraAttachments);
        Renderer.SetTextureView(view0);
        Renderer.SetTextureView(view1, 1);
        Renderer.SetActiveBindGroups([]);
        Renderer.Render(6, false);
        Renderer.DestroyCurrentPass();

        Renderer.SetPipeline(scissorPipeline);
        Renderer.CreatePassDescriptor(scissorAttachment);
        Renderer.SetTextureView(undefined);
        Renderer.SetActiveBindGroups(0);
        Renderer.Render(6);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
        }

        cancelAnimationFrame(raf);
        texture0?.destroy();
        texture1?.destroy();
        start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();

    Device.Destroy([
        videoBuffer,
        uniformBuffer
    ]);
}
