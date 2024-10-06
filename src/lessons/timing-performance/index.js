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

import { UWAL, Shaders, Color, Shape } from "@/index";
import TimingPerformance from "./TimingPerformance.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Timing Performance"));
    }
    catch (error)
    {
        alert(error);
    }

    const segments = 24;
    const colorOffset = 0;
    const offsetOffset = 1;
    const scaleOffset = 0;

    const objectCount = 100;
    const objectInfos = [];

    const module = Renderer.CreateShaderModule([Shaders.ShapeVertex, TimingPerformance]);
    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const vertexLayout = Renderer.CreateVertexBufferLayout("position", void 0, "mainVertex");

    const { buffer: constBuffer, layout: constLayout } =
        Renderer.CreateVertexBuffer(
            [{ name: "color", format: "unorm8x4" }, "offset"],
            objectCount, "instance", "mainVertex"
        );

    const { buffer: varBuffer, layout: varLayout } =
        Renderer.CreateVertexBuffer("scale", objectCount, "instance", "mainVertex");

    const { buffer: colorBuffer, layout: colorLayout } =
        Renderer.CreateVertexBuffer(
            { name: "vertexColor", format: "unorm8x4" },
            objectCount,
            void 0,
            "mainVertex"
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
        const vertexValuesF32 = new Float32Array(vertexValuesU8.buffer);

        for (let o = 0; o < objectCount; ++o)
        {
            const offsetU8 = constStructSize * o;

            vertexValuesU8.set([random(255), random(255), random(255), 255], offsetU8 + colorOffset);
            vertexValuesF32.set([random(), random()], offsetU8 / 4 + offsetOffset);
            objectInfos.push({ scale: random(0.2, 0.5) });
        }

        Renderer.WriteBuffer(constBuffer, vertexValuesF32);
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

    function render()
    {
        const varStructOffset = varBuffer.size / objectCount / 4;

        objectInfos.forEach(({ scale }, o) =>
            vertexValues.set([scale, scale], varStructOffset * o + scaleOffset)
        );

        Renderer.WriteBuffer(varBuffer, vertexValues);
        Renderer.Render([vertices, objectCount]);
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
