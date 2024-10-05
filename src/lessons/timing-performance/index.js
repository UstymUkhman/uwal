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

import { UWAL, Color } from "@/index";
import VertexBuffers from "../vertex-buffers/VertexBuffers.wgsl";

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

    const colorOffset = 0;
    const offsetOffset = 1;

    const scaleOffset = 0;

    const objectCount = 100;
    const objectInfos = [];

    const module = Renderer.CreateShaderModule(VertexBuffers);
    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    Renderer.CreatePassDescriptor(colorAttachment);

    const { vertexData, indexData } = createCircleVertices({
        innerRadius: 0.25, outerRadius: 0.5
    });

    const vertBuffer = Renderer.CreateVertexBuffer(vertexData);
    const indexBuffer = Renderer.CreateIndexBuffer(indexData);

    Renderer.WriteBuffer(vertBuffer, vertexData);
    Renderer.WriteBuffer(indexBuffer, indexData);
    Renderer.SetIndexBuffer(indexBuffer);

    const vertexLayout =
        Renderer.CreateVertexBufferLayout(["position", { name: "vertexColor", format: "unorm8x4" }]);

    const { buffer: constBuffer, layout: constLayout } =
        Renderer.CreateVertexBuffer(
            [{ name: "color", format: "unorm8x4" }, "offset"],
            objectCount,
            "instance"
        );

    const { buffer: varBuffer, layout: varLayout } =
        Renderer.CreateVertexBuffer("scale", objectCount, "instance");

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, void 0, [vertexLayout, constLayout, varLayout])
    });

    Renderer.SetVertexBuffers([vertBuffer, constBuffer, varBuffer]);

    // Write constant vertex values to the GPUBuffer:
    {
        const constStructSize = constBuffer.size / objectCount;
        const vertexValuesU8 = new Uint8Array(constBuffer.size);
        const vertexValuesF32 = new Float32Array(vertexValuesU8.buffer);

        for (let o = 0; o < objectCount; ++o)
        {
            const offsetU8 = constStructSize * o;
            const offsetF32 = offsetU8 / 4;

            vertexValuesU8.set([random(255), random(255), random(255), 255], offsetU8 + colorOffset);
            vertexValuesF32.set([random(-0.9, 0.9), random(-0.9, 0.9)], offsetF32 + offsetOffset);

            objectInfos.push({ scale: random(0.2, 0.5) });
        }

        Renderer.WriteBuffer(constBuffer, vertexValuesF32);
    }

    const vertexValues = new Float32Array(varBuffer.size / Float32Array.BYTES_PER_ELEMENT);

    const vertices = indexData.length;

    function createCircleVertices({
        endAngle = Math.PI * 2,
        subdivisions = 24,
        innerRadius = 0,
        outerRadius = 1,
        startAngle = 0
    })
    {
        // 2 vertices per subdivision, + 1 to wrap around the circle.
        const vertices = (subdivisions + 1) * 2;

        // 1 32-bit color value will be written and read as 4 8-bit values.
        const vertexData = new Float32Array(vertices * (2 + 1));
        const colorData = new Uint8Array(vertexData.buffer);

        let offset = 0;
        // 2 bytes for xy:
        let colorOffset = 8;

        /**
         * @param {number} x
         * @param {number} y
         * @param {number[]} color
         */
        const addVertex = (x, y, color) =>
        {
            vertexData[offset++] = x;
            vertexData[offset++] = y;

            colorData[colorOffset++] = color[0] * 255;
            colorData[colorOffset++] = color[1] * 255;
            colorData[colorOffset++] = color[2] * 255;

            // Skip extra byte (alpha value, defaults to `1`)
            // and the next vertex position (8 bytes):
            colorOffset += 9;

            // Skip the color (1 byte):
            offset += 1;
        };

        const innerColor = [1, 1, 1];
        const outerColor = [0.1, 0.1, 0.1];
        const theta = endAngle - startAngle;

        for (let s = 0; s <= subdivisions; s++)
        {
            const angle = startAngle + s * theta / subdivisions;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            addVertex(cos * outerRadius, sin * outerRadius, outerColor);
            addVertex(cos * innerRadius, sin * innerRadius, innerColor);
        }

        const indexData = new Uint32Array(subdivisions * 6);

        for (let index = 0, i = 0; i < subdivisions; i++)
        {
            const indexOffset = i * 2;

            indexData[index++] = indexOffset + 1; // 0 _____ 2
            indexData[index++] = indexOffset + 3; //  |    /|
            indexData[index++] = indexOffset + 2; //  |   / |
            indexData[index++] = indexOffset + 2; //  |  /  |
            indexData[index++] = indexOffset + 0; //  | /   |
            indexData[index++] = indexOffset + 1; // 1|/____|3
        }

        return { vertexData, indexData };
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
        const aspect = Renderer.AspectRatio;
        const varStructSize = varBuffer.size / objectCount;

        objectInfos.forEach(({ scale }, o) =>
        {
            const offset = (varStructSize / 4) * o;
            vertexValues.set([scale / aspect, scale], offset + scaleOffset);
        });

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
