/**
 * @module Texture Atlases
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Loading Images into Textures
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-importing-textures.html#texture-atlases}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.0.12
 * @license MIT
 */

import { Device, PerspectiveCamera, CubeGeometry, Utils } from "#/index";
import Noodles from "/assets/images/noodles.jpg";
import { mat4 } from "wgpu-matrix";
import Atlas from "./Atlas.wgsl";
import UVData from "./UV";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.RenderPipeline(
            canvas, "Texture Atlases", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const settings =
    {
        rotation: [
            Utils.DegreesToRadians(20),
            Utils.DegreesToRadians(25),
            Utils.DegreesToRadians(0)
        ]
    };

    const radToDegOptions =
    {
        min: -360,
        max: 360,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const Camera = new PerspectiveCamera(60, 0.1, 10);
    Camera.Position = [0, 1, 5]; Camera.LookAt([0, 0, 0]);

    const viewProjection = Camera.UpdateViewProjection(false);
    const objectUniforms = [], gui = new GUI().onChange(render);

    gui.add(settings.rotation, "0", radToDegOptions).name("rotation.x");
    gui.add(settings.rotation, "1", radToDegOptions).name("rotation.y");
    gui.add(settings.rotation, "2", radToDegOptions).name("rotation.z");

    const Texture = new (await Device.Texture(Renderer));
    const source = await Texture.CreateBitmapImage(
        await (await fetch(Noodles)).blob(),
        { colorSpaceConversion: "none" }
    );

    const texture = Texture.CreateTextureFromSource(source);
    const uvBuffer = Renderer.CreateVertexBuffer(UVData);
    const module = Renderer.CreateShaderModule(Atlas);
    Texture.CopyImageToTexture(source, { texture });

    const cube = new CubeGeometry(Renderer);
    Renderer.WriteBuffer(uvBuffer, UVData);
    cube.AddVertexBuffers(uvBuffer);

    Renderer.CreatePipeline({
        primitive: { cullMode: "back" },
        fragment: Renderer.CreateFragmentState(module),
        depthStencil: Renderer.CreateDepthStencilState(),
        vertex: Renderer.CreateVertexState(module, void 0, [
            Renderer.CreateVertexBufferLayout({ name: "position", format: "float32x3" }),
            Renderer.CreateVertexBufferLayout("textureCoord")
        ])
    });

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        void 0,
        Renderer.CreateDepthAttachment()
    );

    Renderer.SetBindGroups(
        Renderer.CreateBindGroup(
            Renderer.CreateBindGroupEntries([
                Texture.CreateSampler({ filter: "linear" }),
                texture.createView(),
                { buffer: cube.TransformBuffer }
            ])
        )
    );

    function render()
    {
        const transform = cube.Transform;
        mat4.copy(viewProjection, transform);

        mat4.rotateX(transform, settings.rotation[0], transform);
        mat4.rotateY(transform, settings.rotation[1], transform);
        mat4.rotateZ(transform, settings.rotation[2], transform);

        cube.Render();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = inlineSize / blockSize;
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
