/**
 * @example Compute Texture
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by WebGPU Lab's "2D Light"
 * {@link https://s-macke.github.io/WebGPU-Lab/#} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.2.3
 * @license MIT
 */

import ComputeShader from "./Compute.wgsl";
import { Device, Shaders } from "#/index";
import RenderShader from "./Render.wgsl";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {unknown} */ let UniformsBuffer;
/** @type {Computation} */ let Computation;
/** @type {ResizeObserver} */ let observer;
/** @type {ComputePipeline} */ let ComputePipeline;

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

    canvas.removeEventListener("touchend", onOut);
    canvas.removeEventListener("mouseleave", onOut);
    canvas.removeEventListener("touchmove", onOver);
    canvas.removeEventListener("mousemove", onOver);
    canvas.removeEventListener("touchstart", onOver);
    canvas.removeEventListener("mouseenter", onOver);

    const Texture = new (await Device.Texture(Renderer));

    async function createComputePipeline(workgroupDimension = 8)
    {
        const format = Texture.PreferredStorageFormat;
        const texture = Texture.CreateStorageTexture();

        const textureBinding = "@group(0) @binding(0) var texture:";
        const textureStorage = `texture_storage_2d<${format}, write>;`;

        ComputePipeline = await Computation.CreatePipeline({
            shader: [`${textureBinding} ${textureStorage}`, ComputeShader],
            constants: { DIMENSION_SIZE: workgroupDimension }
        });

        UniformsBuffer = ComputePipeline.CreateUniformBuffer("uniforms");
        ComputePipeline.SetBindGroupFromResources([texture, UniformsBuffer.buffer]);
        Computation.Workgroups = Renderer.CanvasSize.map(size => size / workgroupDimension);

        UniformsBuffer.uniforms.mouse.fill(Infinity);

        canvas.addEventListener("mouseenter", onOver);
        canvas.addEventListener("touchstart", onOver);
        canvas.addEventListener("mousemove", onOver);
        canvas.addEventListener("touchmove", onOver);
        canvas.addEventListener("mouseleave", onOut);
        canvas.addEventListener("touchend", onOut);

        return texture;
    }

    async function createRenderPipeline(texture)
    {
        const RenderPipeline = await Renderer.CreatePipeline([Shaders.Fullscreen, RenderShader]);
        RenderPipeline.SetBindGroupFromResources([Texture.CreateSampler(), texture]);
        RenderPipeline.SetDrawParams(3);
    }

    function onOver(event)
    {
        UniformsBuffer.uniforms.mouse[0] = event.touches?.[0].clientX ?? event.offsetX;
        UniformsBuffer.uniforms.mouse[1] = canvas.offsetHeight - (event.touches?.[0].clientY ?? event.offsetY);
    }

    function onOut()
    {
        UniformsBuffer.uniforms.mouse.fill(Infinity);
    }

    function clean()
    {
        cancelAnimationFrame(raf);
        UniformsBuffer?.buffer.destroy();
    }

    function start()
    {
        createComputePipeline().then((texture) =>
            createRenderPipeline(texture).then(render)
        );
    }

    function render(time)
    {
        raf = requestAnimationFrame(render);
        UniformsBuffer.uniforms.time[0] = time * 0.001;

        // By passing `UniformsBuffer.uniforms.time.buffer`, we're also
        // writing `UniformsBuffer.uniforms.mouse` coordinates to the GPUBuffer:
        ComputePipeline.WriteBuffer(UniformsBuffer.buffer, UniformsBuffer.uniforms.time.buffer);

        Computation.Compute();
        Renderer.Render();
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
    Device.Destroy(UniformsBuffer.buffer);
}
