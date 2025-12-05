/**
 * @example Video Color Grading
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import Video from "/assets/videos/matrix.mp4";
import { Device, Shaders } from "#/index";
import SinCity from "./SinCity.wgsl";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUBuffer} */ let sizeBuffer;
/** @type {ResizeObserver} */ let observer;
const video = document.createElement("video");

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Video Color Grading"));
    }
    catch (error)
    {
        alert(error);
    }

    const VideoPipeline = await Renderer.CreatePipeline([
        Shaders.Fullscreen, Shaders.Resolution, SinCity
    ]);

    const Texture = new (await Device.Texture());
    const videoSampler = Texture.CreateSampler();

    video.playsinline = video.loop = true;
    video.controls = video.muted = true;
    video.style.position = "absolute";

    let videoWidth, videoHeight;
    video.preload = "auto";
    video.src = Video;

    video.addEventListener("loadedmetadata", () =>
    {
        videoHeight = video.videoHeight;
        videoWidth = video.videoWidth;
        setVideoPosition();
    }, false);

    document.body.appendChild(video);
    VideoPipeline.SetDrawParams(6);

    function setVideoPosition()
    {
        const width = canvas.width / videoWidth;
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

            video.style.bottom = "unset";
            video.style.right = "unset";

            video.height = height;
            video.width = width;
        }
        else
        {
            const scale = Math.min(canvas.clientWidth / videoWidth, 0.67);
            const width = videoWidth * scale, height = videoHeight * scale;

            video.style.right = `${(canvas.clientWidth - width) / 2}px`;
            video.style.bottom = `${canvas.clientHeight / 2}px`;

            video.style.height = `${height}px`;
            video.style.width = `${width}px`;

            video.style.left = "unset";
            video.style.top = "unset";

            video.height = height;
            video.width = width;
        }
    }

    async function start()
    {
        await playVideo(); createSizeBuffer();
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

    function createSizeBuffer()
    {
        const { size, buffer } = VideoPipeline.CreateUniformBuffer("size");
        size.set([videoWidth, videoHeight]); sizeBuffer = buffer;
        VideoPipeline.WriteBuffer(buffer, size);
    }

    function render()
    {
        raf = requestAnimationFrame(render);
        const texture = Texture.ImportExternalTexture(video);

        VideoPipeline.SetBindGroupFromResources([
            Renderer.ResolutionBuffer,
            videoSampler,
            sizeBuffer,
            texture
        ]);

        Renderer.Render();
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            Renderer.DevicePixelRatio = document.body.offsetWidth > 960 && devicePixelRatio || 1;
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
        }

        ((videoWidth && videoHeight) || raf) &&
            ~setVideoPosition() && ~cancelAnimationFrame(raf) && start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    video.remove();
    Device.Destroy(sizeBuffer);
}
