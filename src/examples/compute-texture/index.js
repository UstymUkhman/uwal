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
/** @type {GPUTexture} */ let storageTexture;
/** @type {RenderPipeline} */ let RenderPipeline;
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

    const Texture = new (await Device.Texture(Renderer)), WORKGROUP_DIMENSION = 8;

    canvas.removeEventListener("mouseenter", onOver);
    canvas.removeEventListener("touchstart", onOver);
    canvas.removeEventListener("mousemove", onOver);
    canvas.removeEventListener("touchmove", onOver);
    canvas.removeEventListener("mouseleave", onOut);
    canvas.removeEventListener("touchend", onOut);

    async function createComputePipeline()
    {
        const format = Texture.PreferredStorageFormat;
        storageTexture = Texture.CreateStorageTexture();

        const textureBinding = "@group(0) @binding(0) var texture:";
        const textureStorage = `texture_storage_2d<${format}, write>;`;

        ComputePipeline = await Computation.CreatePipeline({
            shader: [`${textureBinding} ${textureStorage}`, ComputeShader],
            constants: { DIMENSION_SIZE: WORKGROUP_DIMENSION }
        });

        UniformsBuffer = ComputePipeline.CreateUniformBuffer("uniforms");
        ComputePipeline.SetBindGroupFromResources([storageTexture, UniformsBuffer.buffer]);
        Computation.Workgroups = Renderer.CanvasSize.map(size => size / WORKGROUP_DIMENSION);

        UniformsBuffer.uniforms.mouse.fill(Infinity);

        canvas.addEventListener("mouseenter", onOver);
        canvas.addEventListener("touchstart", onOver);
        canvas.addEventListener("mousemove", onOver);
        canvas.addEventListener("touchmove", onOver);
        canvas.addEventListener("mouseleave", onOut);
        canvas.addEventListener("touchend", onOut);
    }

    async function createRenderPipeline()
    {
        RenderPipeline = await Renderer.CreatePipeline([Shaders.Fullscreen, RenderShader]);
        RenderPipeline.SetBindGroupFromResources([Texture.CreateSampler(), storageTexture]);
        RenderPipeline.SetDrawParams(3);
    }

    function onOver(event)
    {
        const { DevicePixelRatio } = Renderer;
        const clientX = event.touches?.[0].clientX ?? event.offsetX;
        const clientY = event.touches?.[0].clientY ?? event.offsetY;

        UniformsBuffer.uniforms.mouse[0] = clientX * DevicePixelRatio;
        UniformsBuffer.uniforms.mouse[1] = (canvas.offsetHeight - clientY) * DevicePixelRatio;
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
        if (ComputePipeline)
        {
            storageTexture.destroy();
            storageTexture = Texture.CreateStorageTexture();
            UniformsBuffer = ComputePipeline.CreateUniformBuffer("uniforms");

            ComputePipeline.SetBindGroupFromResources([storageTexture, UniformsBuffer.buffer]);
            RenderPipeline.SetBindGroupFromResources([Texture.CreateSampler(), storageTexture]);
            Computation.Workgroups = Renderer.CanvasSize.map(size => size / WORKGROUP_DIMENSION);

            return ~UniformsBuffer.uniforms.mouse.fill(Infinity) && render();
        }

        createComputePipeline().then((texture) => createRenderPipeline(texture).then(render));
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
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, blockSize);
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    ComputePipeline = ComputePipeline?.Destroy();
    RenderPipeline = RenderPipeline?.Destroy();
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Computation.Destroy();
    Renderer.Destroy();
    Device.Destroy(
        UniformsBuffer.buffer,
        storageTexture
    );
}
