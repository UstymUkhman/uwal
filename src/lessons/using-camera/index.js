/**
 * @module Using Camera
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Using Video Efficiently
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures-external-video.html#a-web-camera}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import { Device, PerspectiveCamera, Shaders, Color, TEXTURE } from "#/index";
import CameraTexture from "./CameraTexture.wgsl";
import { vec2, mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.RenderPipeline(canvas, "Using Camera"));
    }
    catch (error)
    {
        alert(error);
    }

    const camera = new PerspectiveCamera();
    const video = document.createElement("video");
    const planes = [], spacing = vec2.set(1.2, 0.5);
    camera.Position = [0, 0, 2]; camera.LookAt([0, 0, 0]);
    const viewProjection = camera.UpdateViewProjection(false);

    Renderer.CreatePipeline(Renderer.CreateShaderModule([Shaders.Quad, CameraTexture]));

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const Texture = new (await Device.LegacyTexture());
    await waitForVideo(video); await startPlaying(video);

    for (let i = 0; i < 4; i++) planes.push({
        ...Renderer.CreateUniformBuffer("projection"),
        sampler: Texture.CreateSampler({
            magFilter: (i & 1) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            minFilter: (i & 2) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            addressModeUV: TEXTURE.ADDRESS.REPEAT
        })
    });

    /** @param {HTMLVideoElement} video */
    async function waitForVideo(video)
    {
        try
        {
            video.srcObject = await (navigator.mediaDevices.getUserMedia({
                video: true
            }));

            video.play();
        }
        catch (error)
        {
            const message = error.message && `: ${error.message}` || "";
            console.error(`Could not access the camera${message}.`);
        }
    }

    /** @param {HTMLVideoElement} video */
    function startPlaying(video)
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
        });
    }

    function render()
    {
        requestAnimationFrame(render);
        const texture = Texture.ImportExternalTexture(video);

        planes.forEach(({ sampler, buffer, projection }, o) =>
        {
            const x = o % 2 - 0.5;
            const y = +(o < 2) * 2 - 1;

            const v = [x * spacing[0], y * spacing[1], -0.5];
            mat4.translate(viewProjection, v, projection);

            mat4.rotateX(projection, Math.PI * 0.25 * Math.sign(y), projection);
            mat4.scale(projection, [1, -1, 1], projection);
            mat4.translate(projection, [-0.5, -0.5, 0], projection);

            Renderer.WriteBuffer(buffer, projection);

            Renderer.SetBindGroups(
                Renderer.CreateBindGroup(
                    Renderer.CreateBindGroupEntries([
                        sampler, texture, { buffer }
                    ])
                )
            );

            Renderer.Render(6, false);
        });

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        camera.AspectRatio = Renderer.AspectRatio;
        camera.UpdateViewProjection(false);
        requestAnimationFrame(render);
    });

    canvas.addEventListener("click", () =>
        video[video.paused ? "play" : "pause"]()
    );

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
