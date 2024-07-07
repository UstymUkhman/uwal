/**
 * @module Loading Video
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html#loading-video}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.5
 * @license MIT
 */

import { UWAL, Color, Shaders, TEXTURE } from "@/index";
import GPUMipmaps from "../gpu-mipmaps/GPUMipmaps.wgsl";
import { vec2, mat4 } from "wgpu-matrix";
import Video from "~/assets/video.webm";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Loading Video"));
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
    const spacing = vec2.set(1.2, 0.7);

    const projectionMatrix = mat4.perspective(fov, Renderer.AspectRatio, near, far);
    const viewMatrix = mat4.inverse(mat4.lookAt(cameraPosition, target, up));
    const viewProjectionMatrix = mat4.multiply(projectionMatrix, viewMatrix);

    const video = document.createElement("video");
    video.muted = video.loop = true;
    video.preload = "auto";
    video.src = Video;

    const Texture = new (await UWAL.Texture());
    Texture.SetRenderer(Renderer);

    let haveNewVideoFrame = false;
    await startPlayingAndWaitForVideo(video);
    const texture = createTextureFromSource(video, true);
    const alwaysUpdateVideo = !("requestVideoFrameCallback" in video);

    Renderer.CreatePipeline({ module: Renderer.CreateShaderModule([Shaders.Quad, GPUMipmaps]) });

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    if (!alwaysUpdateVideo)
    {
        const recordHaveNewFrame = () =>
        {
            video.requestVideoFrameCallback(recordHaveNewFrame);
            haveNewVideoFrame = true;
        };

        video.requestVideoFrameCallback(recordHaveNewFrame);
    }

    for (let i = 0; i < 8; i++)
    {
        const sampler = Texture.CreateSampler({
            addressModeU: TEXTURE.ADDRESS.REPEAT,
            addressModeV: TEXTURE.ADDRESS.REPEAT,
            magFilter:    (i & 1) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            minFilter:    (i & 2) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST,
            mipmapFilter: (i & 4) ? TEXTURE.FILTER.LINEAR : TEXTURE.FILTER.NEAREST
        });

        const matrixBufferSize = 16 * Float32Array.BYTES_PER_ELEMENT;

        const matrixBuffer = Renderer.CreateBuffer({
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            size: matrixBufferSize
        });

        const matrixValues = new Float32Array(matrixBufferSize / Float32Array.BYTES_PER_ELEMENT);
        const matrix = matrixValues.subarray(matrixOffset, 16);

        Renderer.AddBindGroups(
            Renderer.CreateBindGroup(
                Renderer.CreateBindGroupEntries([
                    sampler,
                    texture.createView(),
                    { buffer: matrixBuffer }
                ])
            )
        );

        objectInfos.push({ matrixBuffer, matrixValues, matrix });
    }

    /**
     * @param {HTMLVideoElement} source
     * @param {boolean} [mipmaps]
     */
    function createTextureFromSource(source, mipmaps = false)
    {
        return Texture.CopyImageToTexture(source, { create: {
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,
            format: "rgba8unorm",
            mipmaps
        }});
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

        if (alwaysUpdateVideo || haveNewVideoFrame)
        {
            Texture.CopyImageToTexture(video, { texture });
            haveNewVideoFrame = false;
        }

        objectInfos.forEach(({ matrix, matrixBuffer, matrixValues }, o) =>
        {
            const depth = 50;
            const x = o % 4 - 1.5;
            const y = +(o < 4) * 2 - 1;

            const v = [x * spacing[0], y * spacing[1], -depth * 0.5];
            mat4.translate(viewProjectionMatrix, v, matrix);

            mat4.rotateX(matrix, Math.PI * 0.5, matrix);
            mat4.scale(matrix, [1, depth * 2, 1], matrix);
            mat4.translate(matrix, [-0.5, -0.5, 0], matrix);

            Renderer.WriteBuffer(matrixBuffer, matrixValues);
            Renderer.SetActiveBindGroups(o);
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
