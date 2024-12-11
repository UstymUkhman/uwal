/**
 * @module Vertex Buffers
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Vertex Buffers
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-vertex-buffers.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL } from "@/index";
import VertexBuffers from "./VertexBuffers.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Vertex Buffers"));
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

    const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
        undefined, "clear", "store", [0.3, 0.3, 0.3, 1]
    ));

    const module = Renderer.CreateShaderModule(VertexBuffers);

    Renderer.CreatePipeline({
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "vertex", [
            {
                // 4 bytes for vertex color + 2 floats for position, 4 bytes each:
                arrayStride: 4 + 2 * Float32Array.BYTES_PER_ELEMENT,
                attributes: [
                    Renderer.CreateVertexBufferAttribute("float32x2"),             // Position
                    Renderer.CreateVertexBufferAttribute("unorm8x4", 4, 8),        // Vertex Color
                ]
            },
            {
                // 4 bytes for color + 2 floats for offset, 4 bytes each:
                arrayStride: 4 + 2 * Float32Array.BYTES_PER_ELEMENT,
                stepMode: "instance",
                attributes: [
                    Renderer.CreateVertexBufferAttribute("unorm8x4", 1),           // Color
                    Renderer.CreateVertexBufferAttribute("float32x2", 2, 4),       // Offset
                ]
            },
            {
                stepMode: "instance",
                // 2 floats for scale, 4 bytes each:
                arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
                attributes: [Renderer.CreateVertexBufferAttribute("float32x2", 3)] // Scale
            }
        ])
    });

    const constVertexStructSize =
        4 +                                 // Color  - 4 bytes
        2 * Float32Array.BYTES_PER_ELEMENT; // Offset - 2 32bit floats

    const varVertexStructSize =
        2 * Float32Array.BYTES_PER_ELEMENT; // Scale - 2 32bit floats

    const constVertexBufferSize = constVertexStructSize * objectCount;

    const varVertexBufferSize = varVertexStructSize * objectCount;

    const { vertexData, indexData } = createCircleVertices({
        innerRadius: 0.25, outerRadius: 0.5
    });

    const vertBuffer = Renderer.CreateBuffer({
        label: "Vertex Buffer",
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    Renderer.WriteBuffer(vertBuffer, vertexData);

    const constVertexBuffer = Renderer.CreateBuffer({
        label: "Constant Vertex Buffer",
        size: constVertexBufferSize,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    const varVertexBuffer = Renderer.CreateBuffer({
        label: "Variable Vertex Buffer",
        size: varVertexBufferSize,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    Renderer.SetVertexBuffers([vertBuffer, constVertexBuffer, varVertexBuffer]);

    const indexBuffer = Renderer.CreateBuffer({
        label: "Index Buffer",
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    });

    Renderer.WriteBuffer(indexBuffer, indexData);
    Renderer.SetIndexBuffer(indexBuffer);

    // Write constant vertex values to the GPUBuffer:
    {
        const vertexValuesU8 = new Uint8Array(constVertexBufferSize);
        const vertexValuesF32 = new Float32Array(vertexValuesU8.buffer);

        for (let o = 0; o < objectCount; ++o)
        {
            const offsetU8 = constVertexStructSize * o;
            const offsetF32 = offsetU8 / 4;

            vertexValuesU8.set([random(255), random(255), random(255), 255], offsetU8 + colorOffset);
            vertexValuesF32.set([random(-0.9, 0.9), random(-0.9, 0.9)], offsetF32 + offsetOffset);

            objectInfos.push({ scale: random(0.2, 0.5) });
        }

        Renderer.WriteBuffer(constVertexBuffer, vertexValuesF32);
    }

    const vertexValues = new Float32Array(varVertexBufferSize / Float32Array.BYTES_PER_ELEMENT);

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
        Renderer.SetCanvasSize(canvas.width, canvas.height);

        const aspect = Renderer.AspectRatio;

        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        objectInfos.forEach(({ scale }, o) =>
        {
            const offset = (varVertexStructSize / 4) * o;
            vertexValues.set([scale / aspect, scale], offset + scaleOffset);
        });

        Renderer.WriteBuffer(varVertexBuffer, vertexValues);
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

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
