/**
 * @module Storage Textures
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Storage Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-storage-textures.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */

import { UWAL } from "@/index";
import Circles from "./Circles.wgsl";

(async function(canvas)
{
    const availableFeatures = await UWAL.SetRequiredFeatures("bgra8unorm-storage");
    const preferredFormat = UWAL.PreferredCanvasFormat;

    const presentationFormat =
        availableFeatures.has("bgra8unorm-storage") &&
        preferredFormat === "bgra8unorm" ? preferredFormat : "rgba8unorm";

    if (preferredFormat === "bgra8unorm" && presentationFormat === "rgba8unorm")
        console.warn(
            "Preferred canvas format is \"bgra8unorm\", but since \"bgra8unorm-storage\" feature is not available on this device," +
            " a less performant \"rgba8unorm\" format will be used instead, in order to enable storage textures for this program."
        );

    /** @type {InstanceType<Awaited<ReturnType<UWAL.ComputePipeline>>>} */ let Computation;
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Computation = new (await UWAL.ComputePipeline());
        Renderer = new (await UWAL.RenderPipeline(canvas, "Storage Textures", {
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING
        }));
    }
    catch (error)
    {
        alert(error);
    }

    const module = Computation.CreateShaderModule([
        `@group(0) @binding(0) var Texture: texture_storage_2d<${presentationFormat}, write>;`,
        Circles
    ]);

    Computation.CreatePipeline({ module });

    function render()
    {
        const { width, height } = Renderer.CurrentTexture;

        Computation.SetBindGroups(
            Computation.CreateBindGroup(
                Computation.CreateBindGroupEntries(
                    Renderer.CurrentTextureView
                )
            )
        );

        Computation.Workgroups = [width, height];
        Computation.Compute(true);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        render();
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
