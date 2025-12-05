/**
 * @example 2D Lighting
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by WebGPU Lab's "2D Light"
 * {@link https://s-macke.github.io/WebGPU-Lab/#} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import { Device, Shaders } from "#/index";
import Compute from "./Compute.wgsl";
import Render from "./Render.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    /** @type {Computation} */ let Computation;
    const Texture = new (await Device.Texture());

    try
    {
        Computation = new (await Device.Computation("2D Lighting"));
        Renderer = new (await Device.Renderer(canvas, "2D Lighting"));
    }
    catch (error)
    {
        alert(error);
    }

    async function createComputePipeline(workgroupDimension = 8)
    {
        const ComputePipeline = new Computation.Pipeline();

        await Computation.AddPipeline(ComputePipeline, {
            module: ComputePipeline.CreateShaderModule(Compute),
            constants: { DIMENSION_SIZE: workgroupDimension }
        });

        const texture = Texture.CreateStorageTexture({
            size: Renderer.CanvasSize,
            format: "rgba16float"
        });

        ComputePipeline.SetBindGroups(
            ComputePipeline.CreateBindGroup(
                ComputePipeline.CreateBindGroupEntries(
                    texture
                )
            )
        );

        Computation.Workgroups = Renderer.CanvasSize
            .map(size => size / 8);

        return texture;
    }

    async function createRenderPipeline(texture)
    {
        const RenderPipeline = new Renderer.Pipeline();

        await Renderer.AddPipeline(RenderPipeline,
            RenderPipeline.CreateShaderModule([
                Shaders.Fullscreen, Render
            ])
        );

        RenderPipeline.SetBindGroups(
            RenderPipeline.CreateBindGroup(
                RenderPipeline.CreateBindGroupEntries([
                    Texture.CreateSampler(), texture
                ])
            )
        );

        RenderPipeline.SetDrawParams(3);
    }

    createComputePipeline().then((texture) =>
        createRenderPipeline(texture).then(() =>
            ~Computation.Compute() && Renderer.Render()
        )
    );

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
