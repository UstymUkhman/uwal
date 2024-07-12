/**
 * @module Using Video
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Using Video Efficiently
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-textures-external-video.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import VideoTexture from "./VideoTexture.wgsl";
import { vec2, mat4 } from "wgpu-matrix";
import Video from "~/assets/video.mp4";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Using Video"));
    }
    catch (error)
    {
        alert(error);
    }

    const matrixOffset = 0;
    const objectInfos = [];

    const near = 1;
    const far = 2000;

    const up = [0, 1, 0];
    const target = [0, 0, 0];

    const fov = Math.PI * 60 / 180;
    const cameraPosition = [0, 0, 2];
    const spacing = vec2.set(1.2, 0.5);

    const projectionMatrix = mat4.perspective(fov, Renderer.AspectRatio, near, far);
    const viewMatrix = mat4.lookAt(cameraPosition, target, up);
    const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);

    const video = document.createElement("video");
    video.muted = video.loop = true;
    video.preload = "auto";
    video.src = Video;

    Renderer.CreatePipeline({ module: Renderer.CreateShaderModule([Shaders.Quad, VideoTexture]) });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const Texture = new (await UWAL.Texture());
    await startPlayingAndWaitForVideo(video);

    for (let i = 0; i < 4; i++)
    {
        const sampler = Texture.CreateSampler({
            addressModeU: TEXTURE.ADDRESS.REPEAT,
            addressModeV: TEXTURE.ADDRESS.REPEAT,
            magFilter:    (i & 1) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            minFilter:    (i & 2) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST
        });

        const matrixBufferSize = 16 * Float32Array.BYTES_PER_ELEMENT;

        const matrixBuffer = Renderer.CreateBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: matrixBufferSize
        });

        const matrixValues = new Float32Array(matrixBufferSize / Float32Array.BYTES_PER_ELEMENT);
        const matrix = matrixValues.subarray(matrixOffset, 16);

        objectInfos.push({ sampler, matrixBuffer, matrixValues, matrix });
    }

    /** @param {HTMLVideoElement} video */
    function startPlayingAndWaitForVideo(video)
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
        requestAnimationFrame(render);
        const texture = Texture.ImportExternalTexture(video);

        objectInfos.forEach(({ matrix, sampler, matrixBuffer, matrixValues }, o) =>
        {
            const x = o % 2 - 0.5;
            const y = +(o < 2) * 2 - 1;

            const v = [x * spacing[0], y * spacing[1], -0.5];
            mat4.translate(viewProjectionMatrix, v, matrix);

            mat4.rotateX(matrix, Math.PI * 0.25 * Math.sign(y), matrix);
            mat4.scale(matrix, [1, -1, 1], matrix);
            mat4.translate(matrix, [-0.5, -0.5, 0], matrix);

            Renderer.WriteBuffer(matrixBuffer, matrixValues);

            Renderer.SetBindGroups(
                Renderer.CreateBindGroup(
                    Renderer.CreateBindGroupEntries([
                        sampler,
                        texture,
                        { buffer: matrixBuffer }
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

        mat4.perspective(fov, Renderer.AspectRatio, near, far, projectionMatrix);
        mat4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);

        requestAnimationFrame(render);
    });

    canvas.addEventListener("click", () =>
        video[video.paused ? "play" : "pause"]()
    );

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
