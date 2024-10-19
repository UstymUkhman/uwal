/**
 * @module Timing Performance
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Timing Performance
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.9
 * @license MIT
 */

import { UWAL, Shaders, Color, Shape, Utils } from "@/index";
import TimingPerformance from "./TimingPerformance.wgsl";
import RollingAverage from './RollingAverage';

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer, then = 0;

    try
    {
        await UWAL.SetRequiredFeatures("timestamp-query");
        Renderer = new (await UWAL.RenderPipeline(canvas, "Timing Performance"));
    }
    catch (error)
    {
        alert(error);
    }

    const segments = 24;
    const colorOffset = 0;
    const offsetOffset = 0;
    const scaleOffset = 2;

    const gui = new GUI();
    const objectInfos = [];
    const objectCount = 10000;
    const settings = { objects: 100 };
    gui.add(settings, 'objects', 0, objectCount, 1);

    const info = document.createElement("pre");
    const fps = document.createElement("span");
    const gpu = document.createElement("span");
    const js = document.createElement("span");

    info.style.backgroundColor = "rgb(0 0 0 / 0.8)";
    info.style.position = "absolute";
    info.style.padding = "0.5em";
    info.style.display = "grid";
    info.style.color = "white";
    info.style.margin = "0px";
    info.style.left = "0px";
    info.style.top = "0px";

    info.append(fps, gpu, js);
    document.body.appendChild(info);

    const fpsAverage = new RollingAverage();
    const gpuAverage = new RollingAverage();
    const jsAverage = new RollingAverage();

    const module = Renderer.CreateShaderModule([Shaders.ShapeVertex, TimingPerformance]);
    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;

    const gpuTiming = new Utils.GPUTiming(Renderer);
    const querySet = await gpuTiming.QuerySet;

    Renderer.CreatePassDescriptor(
        colorAttachment, void 0, void 0, void 0, Renderer.CreateTimestampWrites(querySet, 0, 1)
    );

    const vertexLayout = Renderer.CreateVertexBufferLayout("position", void 0, "mainVertex");

    const { buffer: constBuffer, layout: constLayout } = Renderer.CreateVertexBuffer(
        [{ name: "color", format: "unorm8x4" }], objectCount, "instance", "mainVertex"
    );

    const { buffer: varBuffer, layout: varLayout } =
        Renderer.CreateVertexBuffer(["offset", "scale"], objectCount, "instance", "mainVertex");

    const { buffer: colorBuffer, layout: colorLayout } = Renderer.CreateVertexBuffer(
        { name: "vertexColor", format: "unorm8x4" }, objectCount, void 0, "mainVertex"
    );

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "mainVertex", [
            vertexLayout, constLayout, varLayout, colorLayout
        ])
    });

    const vertices = new Shape({ renderer: Renderer, innerRadius: 120, radius: 240, segments })
        .Update().Vertices;

    const vertexValues = new Float32Array(varBuffer.size / Float32Array.BYTES_PER_ELEMENT);

    Renderer.AddVertexBuffers([constBuffer, varBuffer, colorBuffer]);

    // Write constant vertex values to the GPUBuffer:
    {
        const constStructSize = constBuffer.size / objectCount;
        const vertexValuesU8 = new Uint8Array(constBuffer.size);

        for (let o = 0; o < objectCount; ++o)
        {
            vertexValuesU8.set(
                [random(255), random(255), random(255), 255],
                constStructSize * o + colorOffset
            );

            objectInfos.push({
                scale: random(0.2, 0.5),
                offset: [random(-0.9, 0.9), random(-0.9, 0.9)],
                velocity: [random(-0.1, 0.1), random(-0.1, 0.1)]
            });
        }

        Renderer.WriteBuffer(constBuffer, vertexValuesU8);
    }

    // Write vertex color values to the GPUBuffer:
    {
        const outerColor = new Color(0x191919);
        const innerColor = new Color(0xffffff);

        const colorData = new Uint8Array((segments + 1) * 8);

        for (let s = 0, o = 0; s <= segments; s++, o += 8)
        {
            colorData.set(outerColor.RGBA, o);
            colorData.set(innerColor.RGBA, o + 4);
        }

        Renderer.WriteBuffer(colorBuffer, colorData);
    }

    /**
     * @param {number} [min]
     * @param {number} [max]
     */
    function random(min, max)
    {
             if (min === undefined) { min = 0;   max = 1; }
        else if (max === undefined) { max = min; min = 0; }

        return Math.random() * (max - min) + min;
    }

    async function render(now)
    {
        now *= 0.001;
        const deltaTime = now - then;
        const startTime = performance.now();
        const varStructSize = varBuffer.size / objectCount / 4;

        for (let o = 0; o < settings.objects; o++)
        {
            const { scale, offset, velocity } = objectInfos[o];

            offset[0] = Utils.EuclideanModulo(offset[0] + velocity[0] * deltaTime + 1.5, 3) - 1.5;
            offset[1] = Utils.EuclideanModulo(offset[1] + velocity[1] * deltaTime + 1.5, 3) - 1.5;

            const off = o * varStructSize;
            vertexValues.set(offset, off + offsetOffset);
            vertexValues.set([scale, scale], off + scaleOffset);
        }

        Renderer.WriteBuffer(varBuffer, vertexValues);
        Renderer.Render([vertices, settings.objects], false);
        Renderer.DestroyCurrentPass(); // Need to end render pass.

        fpsAverage.addSample(1 / deltaTime);
        jsAverage.addSample(performance.now() - startTime);
        gpuTiming.ResolveAndSubmit().then(gpuTime => gpuAverage.addSample(gpuTime / 1e3));

        fps.textContent = `FPS: ${fpsAverage.get().toFixed(1)}`;
        js.textContent = `JS: ${jsAverage.get().toFixed(1)}ms`;
        gpu.textContent = `GPU: ${gpuTiming.Enabled && `${gpuAverage.get().toFixed(1)}µs` || "N/A"}`;

        requestAnimationFrame(render);
        then = now;
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        requestAnimationFrame(render);
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
