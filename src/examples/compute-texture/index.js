/**
 * @example Compute Texture
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

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {Computation} */ let Computation;
/** @type {ResizeObserver} */ let observer;

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Computation = new (await Device.Computation("Compute Texture"));
        Renderer = new (await Device.Renderer(canvas, "Compute Texture"));
    }
    catch (error)
    {
        alert(error);
    }

    const Texture = new (await Device.Texture(Renderer));

    function clean() { cancelAnimationFrame(raf); }

    function start()
    {
        createComputePipeline().then((texture) =>
            createRenderPipeline(texture).then(() =>
                ~Computation.Compute() && Renderer.Render()
            )
        );
    }

    async function createComputePipeline(workgroupDimension = 8)
    {
        const format = Texture.PreferredStorageFormat;
        const texture = Texture.CreateStorageTexture();

        const ComputePipeline = await Computation.CreatePipeline({
            shader: [`@group(0) @binding(0) var texture: texture_storage_2d<${format}, write>;`, Compute],
            constants: { DIMENSION_SIZE: workgroupDimension }
        });

        Computation.Workgroups = Renderer.CanvasSize.map(size => size / workgroupDimension);

        ComputePipeline.SetBindGroups(
            ComputePipeline.CreateBindGroup(
                ComputePipeline.CreateBindGroupEntries(
                    texture
                )
            )
        );

        return texture;
    }

    async function createRenderPipeline(texture)
    {
        const RenderPipeline = await Renderer.CreatePipeline([
            Shaders.Fullscreen, Render
        ]);

        RenderPipeline.SetBindGroups(
            RenderPipeline.CreateBindGroup(
                RenderPipeline.CreateBindGroupEntries([
                    Texture.CreateSampler(), texture
                ])
            )
        );

        RenderPipeline.SetDrawParams(3);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - 240;
            Renderer.SetCanvasSize(width, blockSize);
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Computation.Destroy();
    Renderer.Destroy();
    Device.Destroy();
}
