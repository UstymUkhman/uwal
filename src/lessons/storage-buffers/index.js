/**
 * @module Storage Buffers
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Storage Buffers
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-storage-buffers.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.4
 * @license MIT
 */

import { UWAL } from "@/index";
import StorageBuffers from "./StorageBuffers.wgsl";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(canvas, "Storage Buffers"));
    }
    catch (error)
    {
        alert(error);
    }

    const colorOffset = 0;
    const offsetOffset = 4;

    const scaleOffset = 0;

    const objectCount = 100;
    const objectInfos = [];

    const descriptor = Renderer.CreatePassDescriptor(Renderer.CreateColorAttachment(
        undefined, "clear", "store", [0.3, 0.3, 0.3, 1]
    ));

    const module = Renderer.CreateShaderModule(StorageBuffers);

    Renderer.CreatePipeline({
        vertex: Renderer.CreateVertexState(module),
        fragment: Renderer.CreateFragmentState(module)
    });

    const constStorageStructSize =
        4 * Float32Array.BYTES_PER_ELEMENT + // Color  - 4 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT + // Offset - 2 32bit floats
        2 * Float32Array.BYTES_PER_ELEMENT;  // Padding

    const constStorageBufferSize = constStorageStructSize * objectCount;

    const varStorageStructSize =
        2 * Float32Array.BYTES_PER_ELEMENT;  // Scale - 2 32bit floats

    const varStorageBufferSize = varStorageStructSize * objectCount;

    const { vertexData, vertices } = createCircleVertices({
        innerRadius: 0.25, outerRadius: 0.5
    });

    const constStorageBuffer = Renderer.CreateBuffer({
        label: "Constant Storage Buffer",
        size: constStorageBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    const varStorageBuffer = Renderer.CreateBuffer({
        label: "Variable Storage Buffer",
        size: varStorageBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    const vertStorageBuffer = Renderer.CreateBuffer({
        label: "Vertices Storage Buffer",
        size: vertexData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
    });

    Renderer.WriteBuffer(vertStorageBuffer, vertexData);

    // Write constant storage values to the GPUBuffer:
    {
        const storageValues = new Float32Array(constStorageBufferSize / Float32Array.BYTES_PER_ELEMENT);

        for (let o = 0; o < objectCount; ++o)
        {
            const offset = constStorageStructSize / 4 * o;

            storageValues.set([random(), random(), random(), 1], offset + colorOffset);
            storageValues.set([random(-0.9, 0.9), random(-0.9, 0.9)], offset + offsetOffset);

            objectInfos.push({ scale: random(0.2, 0.5) });
        }

        Renderer.WriteBuffer(constStorageBuffer, storageValues);
    }

    const storageValues = new Float32Array(varStorageBufferSize / Float32Array.BYTES_PER_ELEMENT);

    const bindGroup = Renderer.CreateBindGroup(
        Renderer.CreateBindGroupEntries([
            { buffer: constStorageBuffer },
            { buffer: varStorageBuffer },
            { buffer: vertStorageBuffer }
        ])
    );

    Renderer.SetBindGroups(bindGroup);

    function createCircleVertices({
        endAngle = Math.PI * 2,
        subdivisions = 24,
        innerRadius = 0,
        outerRadius = 1,
        startAngle = 0,
    })
    {
        // There are 2 triangles per subdivision with 3 vertices
        // per each triangle, and 2 values (xy) per each vertex.
        const vertices = subdivisions * 3 * 2;
        const vertexData = new Float32Array(vertices * 2);

        let offset = 0;

        /** @param {number} x @param {number} y */
        const addVertex = (x, y) =>
        {
            vertexData[offset++] = x;
            vertexData[offset++] = y;
        };

        const theta = endAngle - startAngle;

        for (let s = 0; s < subdivisions; s++)
        {
            const sa = startAngle + (s + 0) * theta / subdivisions;
            const ea = startAngle + (s + 1) * theta / subdivisions;

            const cos_sa = Math.cos(sa);
            const sin_sa = Math.sin(sa);
            const cos_ea = Math.cos(ea);
            const sin_ea = Math.sin(ea);

            addVertex(cos_sa * innerRadius, sin_sa * innerRadius); //    4 _____ 2, 3
            addVertex(cos_ea * innerRadius, sin_ea * innerRadius); //     |    /|
            addVertex(cos_ea * outerRadius, sin_ea * outerRadius); //     |   / |
            addVertex(cos_ea * outerRadius, sin_ea * outerRadius); //     |  /  |
            addVertex(cos_sa * outerRadius, sin_sa * outerRadius); //     | /   |
            addVertex(cos_sa * innerRadius, sin_sa * innerRadius); // 0, 5|/____|1
        }

        return { vertexData, vertices };
    }

    function random(min = 0, max = 1)
    {
        if (max === undefined)
        {
            max = min;
            min = 0;
        }

        return Math.random() * (max - min) + min;
    }

    function render()
    {
        Renderer.SetCanvasSize(canvas.width, canvas.height);

        const aspect = Renderer.AspectRatio;

        descriptor.colorAttachments[0].view = Renderer.CurrentTextureView;

        objectInfos.forEach(({ scale }, o) =>
        {
            const offset = (varStorageStructSize / 4) * o;
            storageValues.set([scale / aspect, scale], offset + scaleOffset);
        });

        Renderer.WriteBuffer(varStorageBuffer, storageValues);
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
