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

import { UWAL, Primitives, Utils } from "@/index";
import Cubemap from "./Cubemap.wgsl";
import { mat4 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {InstanceType<Awaited<ReturnType<UWAL.RenderPipeline>>>} */ let Renderer, aspect;

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

    const colorAttachment = Renderer.CreateColorAttachment();
    colorAttachment.clearValue = [0, 0, 0, 1];

    Renderer.CreatePassDescriptor(colorAttachment, void 0, Renderer.CreateDepthAttachment());
    const module = Renderer.CreateShaderModule(Cubemap);
    const fov = Utils.DegreesToRadians(60);

    Renderer.CreatePipeline({
        primitive: { cullMode: "back" },
        fragment: Renderer.CreateFragmentState(module),
        vertex: Renderer.CreateVertexState(module, void 0,
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

    const Texture = new (await UWAL.Texture());
    const cube = new Primitives.Cube(Renderer);
    const transform = cube.Transform;

    Texture.SetRenderer(Renderer);
    cube.SetGeometryBuffers();

    const faces =
    [
        { faceColor: "#F00", textColor: "#0FF", text: "+X" },
        { faceColor: "#FF0", textColor: "#00F", text: "-X" },
        { faceColor: "#0F0", textColor: "#F0F", text: "+Y" },
        { faceColor: "#0FF", textColor: "#F00", text: "-Y" },
        { faceColor: "#00F", textColor: "#FF0", text: "+Z" },
        { faceColor: "#F0F", textColor: "#0F0", text: "-Z" }
    ]
    .map(faceOption => generateFace(faceOption));

    const sampler = Texture.CreateSampler({ filter: "linear" });
    const texture = createTextureFromSources(faces);

    Renderer.SetBindGroups(
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                sampler,
                { buffer: cube.TransformBuffer },
                texture.createView({ dimension: "cube" })
            ])
        )
    );

    const view = mat4.lookAt(
        [0, 1, 5], // Position
        [0, 0, 0], // Target
        [0, 1, 0]  // Up
    );

    const settings =
    {
        rotation:
        [
            Utils.DegreesToRadians(20),
            Utils.DegreesToRadians(25),
            Utils.DegreesToRadians(0)
        ]
    };

    const radToDeg =
    {
        converters: GUI.converters.radToDeg,
        min: -360,
        max: 360,
        step: 1
    };

    const gui = new GUI();
    gui.onChange(render);

    gui.add(settings.rotation, "0", radToDeg).name("rotation.x");
    gui.add(settings.rotation, "1", radToDeg).name("rotation.y");
    gui.add(settings.rotation, "2", radToDeg).name("rotation.z");

    /**
     * @typedef {Object} FaceOptions
     * @property {string} faceColor
     * @property {string} textColor
     * @property {string} text
     * @param {FaceOptions} options
     */
    function generateFace({ faceColor, textColor, text })
    {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = canvas.height = 128;
        context.fillStyle = faceColor;
        context.fillRect(0, 0, 128, 128);

        context.textAlign = "center";
        context.fillStyle = textColor;
        context.textBaseline = "middle";
        context.font = "90px sans-serif";
        context.fillText(text, 64, 64);

        return canvas;
    }

    /** @param {HTMLCanvasElement[]} sources */
    function createTextureFromSources(sources)
    {
        // Assuming all sources are of the same size,
        // use the first one for width and height:
        const source = sources[0];

        const texture = Texture.CreateTextureFromSource(source,
        {
            size: [source.width, source.height, sources.length],
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST,
            format: "rgba8unorm"
        });

        sources.forEach((source, layer) =>
            Texture.CopyImageToTexture(source,
            {
                generateMipmaps: layer === sources.length - 1,
                destinationOrigin: [0, 0, layer],
                texture
            })
        );

        return texture;
    }

    function render()
    {
        mat4.perspective(fov, aspect, 0.1, 10, transform);
        mat4.multiply(transform, view, transform);

        mat4.rotateX(transform, settings.rotation[0], transform);
        mat4.rotateY(transform, settings.rotation[1], transform);
        mat4.rotateZ(transform, settings.rotation[2], transform);

        cube.UpdateTransformBuffer();
        Renderer.Render(cube.Vertices);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        aspect = Renderer.AspectRatio;
        render();
    });

    observer.observe(canvas);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
