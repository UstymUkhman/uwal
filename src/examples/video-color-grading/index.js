/**
 * @example Video Color Grading
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed by using a version listed below.
 * Please note that this code may be simplified in future
 * thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */

import Video from "/assets/videos/matrix.mp4";
import { UWAL, Shaders } from "#/index";
import SinCity from "./SinCity.wgsl";

/** @type {number} */ let raf, videoBuffer;
/** @type {ResizeObserver} */ let observer;
const video = document.createElement("video");

/** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Video Color Grading"));
    }
    catch (error)
    {
        alert(error);
    }

    const Texture = new (await UWAL.Texture());
    const videoSampler = Texture.CreateSampler();
    let videoWidth, videoHeight, resolutionBuffer;

    video.playsinline = video.loop = true;
    video.controls = video.muted = true;
    video.style.position = "absolute";
    video.preload = "auto";
    video.src = Video;

    Renderer.CreatePipeline({
        module: Renderer.CreateShaderModule([
            Shaders.Quad, Shaders.Resolution, SinCity
        ])
    });

    Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment());

    video.addEventListener("loadedmetadata", () =>
    {
        videoHeight = video.videoHeight;
        videoWidth = video.videoWidth;
        setVideoPosition();
    }, false);

    document.body.appendChild(video);

    function setVideoPosition()
    {
        const width = canvas.width / video.videoWidth;
        const { offsetWidth, offsetHeight } = document.body;
        const scale = Math.min(width, 1 / 3 * 2) * (1 / width);

        if (offsetWidth <= 960)
        {
            const width = offsetWidth * scale;
            const height = videoHeight * width / videoWidth;

            video.style.left = `${(offsetWidth - width) / 2}px`;
            video.style.top = `${offsetHeight / 2 - height}px`;

            video.style.height = `${height}px`;
            video.style.width = `${width}px`;

            video.height = height;
            video.width = width;
        }
        else
        {
            const scale = Math.min(canvas.width / videoWidth, 0.67);
            const width = videoWidth * scale, height = videoHeight * scale;

            video.style.right = `${(canvas.width - width) / 2}px`;
            video.style.bottom = `${canvas.height / 2}px`;

            video.style.height = `${height}px`;
            video.style.width = `${width}px`;

            video.height = height;
            video.width = width;
        }
    }

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
        const videoValues = new Float32Array(2);

        videoBuffer = Renderer.CreateBuffer({
            size: Float32Array.BYTES_PER_ELEMENT * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        videoValues.set([video.videoWidth, video.videoHeight]);
        Renderer.WriteBuffer(videoBuffer, videoValues);
    }

    function render()
    {
        raf = requestAnimationFrame(render);
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
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
            resolutionBuffer = Renderer.ResolutionBuffer;
        }

        videoWidth && videoHeight && setVideoPosition();
        cancelAnimationFrame(raf), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.OnDeviceLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    video.remove();
    Renderer.Destroy();
    UWAL.Destroy(videoBuffer);
}
