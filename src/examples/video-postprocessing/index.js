/**
 * @example Video Postprocessing
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */

import Postprocessing from "./Postprocessing.wgsl";
import Video from "/assets/video/pomeranian.mp4";
import { UWAL, Shaders } from "@/index";

/** @type {number} */ let raf;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Video Postprocessing"));
    }
    catch (error)
    {
        alert(error);
    }

    const Texture = new (await UWAL.Texture());
    const videoSampler = Texture.CreateSampler();
    const video = document.createElement("video");
    let resolutionBuffer, videoBuffer, videoValues;

    video.muted = video.loop = true;
    video.preload = "auto";
    video.src = Video;

    Renderer.CreatePipeline({
        module: Renderer.CreateShaderModule([
            Shaders.Quad, Shaders.Resolution, Postprocessing
        ])
    });

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment());

    async function start()
    {
        await playVideo();
        createVideoBuffer();
        raf = requestAnimationFrame(render);
    }

    function playVideo()
    {
        return new Promise((resolve, reject) =>
        {
            video.addEventListener("error", reject);

            if ("requestVideoFrameCallback" in video)
                video.requestVideoFrameCallback(resolve);

            else
            {
                const timeWatcher = () => /** @type {HTMLVideoElement} */ (video)
                    .currentTime ? resolve() : requestAnimationFrame(timeWatcher);

                timeWatcher();
            }

            video.play().catch(reject);
        });
    }

    function createVideoBuffer()
    {
        videoValues = new Float32Array(4);

        videoBuffer = Renderer.CreateBuffer({
            size: Float32Array.BYTES_PER_ELEMENT * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        videoValues.set([video.videoWidth, video.videoHeight], 2);
    }

    /** @param {DOMHighResTimeStamp} time */
    function render(time)
    {
        videoValues.set([time * 0.001], 1);
        raf = requestAnimationFrame(render);

        Renderer.WriteBuffer(videoBuffer, videoValues);
        const texture = Texture.ImportExternalTexture(video);

        Renderer.SetBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    { buffer: resolutionBuffer },
                    { buffer: videoBuffer },
                    videoSampler,
                    texture
                ])
            )
        );

        Renderer.Render(6);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            resolutionBuffer = Renderer.ResolutionBuffer;
        }

        cancelAnimationFrame(raf), start();
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
