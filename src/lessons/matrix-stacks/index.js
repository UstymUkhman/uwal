/**
 * @module Matrix Stacks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Cameras
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-stacks.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.1.0
 * @license MIT
 */

import { Device, PerspectiveCamera, CubeGeometry } from "#/index";
import { mat4 } from "wgpu-matrix";
import Cube from "./Cube.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.Renderer(
            canvas, "Matrix Stacks", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const radToDegOptions =
    {
        min: -360,
        max: 360,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    let objectIndex = 0;
    const objectInfos = [];
    const WHITE = [1, 1, 1, 1];
    const rotation = mat4.create();

    const settings = { baseRotation: 0 };
    const gui = new GUI().onChange(render);
    gui.add(settings, "baseRotation", radToDegOptions);

    const Camera = new PerspectiveCamera(60, 1, 2000);
    Camera.Position = [0, 3, 6]; Camera.LookAt([0, 1, 0]);
    const viewProjection = Camera.UpdateViewProjection(false);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const cube = new CubeGeometry();
    const RenderPipeline = new Renderer.Pipeline();
    const module = RenderPipeline.CreateShaderModule(Cube);

    const { layout: colorLayout, buffer: colorBuffer } =
        RenderPipeline.CreateVertexBuffer(
            // 6 faces * 2 triangles * 3 vertices:
            { name: "color", format: "unorm8x4" }, 36
        );

    cube.SetRenderPipeline(
        await Renderer.AddPipeline(RenderPipeline,
        {
            primitive: { cullMode: "back" },
            fragment: RenderPipeline.CreateFragmentState(module),
            depthStencil: RenderPipeline.CreateDepthStencilState(),
            vertex: RenderPipeline.CreateVertexState(module, void 0, [
                RenderPipeline.CreateVertexBufferLayout(cube.PositionAttribute),
                colorLayout
            ])
        })
    );

    /* Create Cube Vertices */ {
        const colors = [
            200, 200,  70, // Top
             90, 130, 110, // Bottom
             70, 200, 210, // Front
            160, 160, 220, // Back
            200,  70, 120, // Left
             80,  70, 200  // Right
        ];

        const vertices = cube.UV.length / 2;
        const colorData = new Uint8Array(vertices * 4);

        for (let v = 0, i = 0; v < vertices; i = (++v / 4 | 0) * 3)
        {
            const color = colors.slice(i, i + 3);
            colorData.set(color, v * 4);
            colorData[v * 4 + 3] = 255;
        }

        RenderPipeline.WriteBuffer(colorBuffer, colorData);
        cube.AddVertexBuffers(colorBuffer);
    }

    const createObjectInfo = () =>
    {
        const { color: colorValue, buffer: colorBuffer } =
            RenderPipeline.CreateUniformBuffer("color");

        RenderPipeline.SetBindGroups(
            RenderPipeline.CreateBindGroup(
                RenderPipeline.CreateBindGroupEntries([
                    colorBuffer,
                    cube.TransformBuffer
                ])
            )
        );

        return { colorValue, colorBuffer };
    };

    function render()
    {
        mat4.rotationY(settings.baseRotation, rotation);
        mat4.multiply(viewProjection, rotation, cube.Transform);

        if (objectIndex === objectInfos.length) objectInfos.push(createObjectInfo());
        const { colorBuffer, colorValue } = objectInfos[objectIndex++];

        colorValue.set(WHITE);
        RenderPipeline.WriteBuffer(colorBuffer, colorValue);

        cube.Update();
        Renderer.Render();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
