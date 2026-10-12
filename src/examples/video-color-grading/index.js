/**
 * @example Video Color Grading
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is developed using the version listed below.
 * Please note that this code may be simplified in the future
 * thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import * as UWAL from "#/index";
import SinCity from "./SinCity.wgsl";
import Video from "/assets/videos/matrix.mp4";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUBuffer} */ let sizeBuffer;

const video = document.createElement("video");
const canvas = document.getElementById("preview");

try
{
    Renderer = new (await UWAL.Renderer(canvas, "Video Color Grading"));
}
catch (error)
{
    alert(error);
}

const Texture = new (await UWAL.Texture());
const videoSampler = Texture.CreateSampler();
const VideoPipeline = await Renderer.CreatePipeline([
    UWAL.Shaders.Fullscreen, SinCity
]);

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
    ~setVideoPosition() && start();
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
    await playVideo();

    sizeBuffer = VideoPipeline.WriteBufferData(
        VideoPipeline.CreateUniformBuffer("size"),
        [videoWidth, videoHeight]
    );

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

function render()
{
    const texture = Texture.ImportExternalTexture(video);

    VideoPipeline.SetBindGroupFromResources([
        Renderer.ResolutionBuffer,
        videoSampler,
        sizeBuffer,
        texture
    ]);

    Renderer.Render();
    raf = requestAnimationFrame(render);
}

export function resize(width)
{
    Renderer.DevicePixelRatio = +(innerWidth <= 960) || devicePixelRatio;
    Renderer.SetCanvasSize(width, innerHeight);

    if (raf)
    {
        cancelAnimationFrame(raf);
        setVideoPosition();
        start();
    }
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    Renderer.Destroy();
    video.remove();
    UWAL.Device.Destroy(sizeBuffer);
}
