/**
 * @module Cubemaps
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Cubemaps
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-cube-maps.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.6
 * @license MIT
 */

import { UWAL, Color } from "@/index";
import Cubemap from "./Cubemap.wgsl";
import { mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.RenderPipeline(
            canvas, "Cubemaps", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const module = Renderer.CreateShaderModule(Cubemap);

    Renderer.CreatePipeline({
        primitive: { cullMode: "back" },
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, "vertex",
        {
            arrayStride: Float32Array.BYTES_PER_ELEMENT * 3,
            attributes: [Renderer.CreateVertexBufferAttribute("float32x3")]
        }),

        depthStencil:
        {
            depthWriteEnabled: true,
            format: "depth24plus",
            depthCompare: "less"
        }
    });

    // const colorAttachment = Renderer.CreateColorAttachment();
    // colorAttachment.clearValue = new Color(0x4c4c4c).rgba;
    // Renderer.CreatePassDescriptor(colorAttachment);

    const faceSize = 128;

    const faces =
    [
        { faceColor: "#F00", textColor: "#0FF", text: "+X" },
        { faceColor: "#FF0", textColor: "#00F", text: "-X" },
        { faceColor: "#0F0", textColor: "#F0F", text: "+Y" },
        { faceColor: "#0FF", textColor: "#F00", text: "-Y" },
        { faceColor: "#00F", textColor: "#FF0", text: "+Z" },
        { faceColor: "#F0F", textColor: "#0F0", text: "-Z" }
    ]
    .map(faceOption => generateFace(faceSize, faceOption));

    for (const option of faces) document.body.appendChild(option);

    const Texture = new (await UWAL.Texture());
    // Texture.SetRenderer(Renderer);

    const texture = createTextureFromSources(faces);

    /** @param {HTMLCanvasElement[]} sources */
    function createTextureFromSources(sources)
    {
        // Assuming all sources are of the same size,
        // use the first one for width and height:
        const source = sources[0];

        const texture = Texture.CreateTextureFromSource(source, {
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,
            format: "rgba8unorm",
            mipmaps: true
        });

        sources.forEach((source, layer) =>
            Texture.CopyImageToTexture(source,
            {
                destinationOrigin: [0, 0, layer],
                generateMipmaps: !layer, // false,
                texture
            })
        );

        // this.GenerateMipmaps(texture);

        return texture;
    }

    /**
     * @typedef {Object} FaceOptions
     * @property {string} faceColor
     * @property {string} textColor
     * @property {string} text
     *
     * @param {number} faceSize
     * @param {FaceOptions} options
     */
    function generateFace(faceSize, { faceColor, textColor, text })
    {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = canvas.height = faceSize;
        const halfSize = faceSize * 0.5;

        console.log(faceSize);

        context.fillStyle = faceColor;
        context.fillRect(0, 0, faceSize, faceSize);

        context.textAlign = "center";
        context.fillStyle = textColor;
        context.textBaseline = "middle";
        context.font = `${faceSize * 0.7}px sans-serif`;
        context.fillText(text, halfSize, halfSize);

        return canvas;
    }

    function createCubeVertices() {
        const vertexData = new Float32Array(
        [
            // Top
            -1,  1,  1,
             1,  1,  1,
            -1,  1, -1,
             1,  1, -1,

             // Bottom
             1, -1,  1,
            -1, -1,  1,
             1, -1, -1,
            -1, -1, -1,

            // Front
            -1,  1,  1,
            -1, -1,  1,
             1,  1,  1,
             1, -1,  1,

             // Back
             1,  1, -1,
             1, -1, -1,
            -1,  1, -1,
            -1, -1, -1,

            // Left
            -1,  1,  1,
            -1,  1, -1,
            -1, -1,  1,
            -1, -1, -1,

            // Right
            1,  1, -1,
            1,  1,  1,
            1, -1, -1,
            1, -1,  1
        ]);

        const indexData = new Uint16Array(
        [
             0,  1,  2,  2,  1,  3, // Top
             4,  5,  6,  6,  5,  7, // Bottom
             8,  9, 10, 10,  9, 11, // Front
            12, 13, 14, 14, 13, 15, // Back
            16, 17, 18, 18, 17, 19, // Left
            20, 21, 22, 22, 21, 23  // Right
        ]);

        return {
            vertexData, indexData,
            vertices: indexData.length
        };
    }

    function render()
    {
        // requestAnimationFrame(render);
        // Renderer.Render(6);
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
