/**
 * @module Matrix Stacks
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Stacks
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-stacks.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.1.0
 * @license MIT
 */

import { Device, PerspectiveCamera, CubeGeometry } from "#/index";
import MatrixStack from "./MatrixStack";
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
        min: -180,
        max: 180,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const cabinetColor = [0.75, 0.75, 0.75, 0.75];
    const [width, height, depth] = [0, 1, 2];

    const handleColor = [0.5, 0.5, 0.5, 1];
    const drawerColor = [1, 1, 1, 1];

    const drawerSize = [40, 30, 50];
    const handleSize = [10, 2, 2];
    const drawersPerCabinet = 4;

    const objectInfos = [];
    let objectIndex = 0;
    const cabinets = 5;

    const stack = new MatrixStack();
    const settings = { baseRotation: 0 };
    const gui = new GUI().onChange(render);
    gui.add(settings, "baseRotation", radToDegOptions);

    const Camera = new PerspectiveCamera(60, 1, 2000);
    Camera.Position = [0, 15, 250]; Camera.LookAt([0, 5, 0]);
    const viewProjection = Camera.UpdateViewProjection(false);

    const handlePosition = [0,
        drawerSize[height] / 3 * 2 - drawerSize[height] / 2,
        handleSize[depth] / 2 + drawerSize[depth] / 2
    ];

    const cabinetSpacing = drawerSize[width] + 10;
    const drawerSpacing = drawerSize[height] + 3;

    const cabinetSize = [
        drawerSize[width] + 6,
        drawerSpacing * drawersPerCabinet + 6,
        drawerSize[depth] + 4,
    ];

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const cube = new CubeGeometry();
    const CubePipeline = new Renderer.Pipeline();
    const module = CubePipeline.CreateShaderModule(Cube);

    const { layout: colorLayout, buffer: colorBuffer } =
        CubePipeline.CreateVertexBuffer(
            // 6 faces * 2 triangles * 3 vertices:
            { name: "color", format: "unorm8x4" }, 36
        );

    cube.SetRenderPipeline(
        await Renderer.AddPipeline(CubePipeline,
        {
            primitive: { cullMode: "back" },
            fragment: CubePipeline.CreateFragmentState(module),
            depthStencil: CubePipeline.CreateDepthStencilState(),
            vertex: CubePipeline.CreateVertexState(module, void 0, [
                cube.GetPositionBufferLayout(CubePipeline), colorLayout
            ])
        })
    );

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

    CubePipeline.WriteBuffer(colorBuffer, colorData);
    cube.AddVertexBuffers(colorBuffer);

    function drawObject(matrix, color)
    {
        // Create Object Info Function:
        if (objectIndex === objectInfos.length)
        {
            const { projection: projectionValue, buffer: projectionBuffer } =
                CubePipeline.CreateUniformBuffer("projection");

            const { color: colorValue, buffer: colorBuffer } =
                CubePipeline.CreateUniformBuffer("color");

            CubePipeline.AddBindGroups(
                CubePipeline.CreateBindGroup(
                    CubePipeline.CreateBindGroupEntries([
                        colorBuffer, projectionBuffer
                    ])
                )
            );

            objectInfos.push({ projectionValue, projectionBuffer, colorValue, colorBuffer });
        }

        const { projectionValue, projectionBuffer, colorValue, colorBuffer } =
            objectInfos[objectIndex];

        colorValue.set(color);
        CubePipeline.WriteBuffer(colorBuffer, colorValue);

        mat4.multiply(viewProjection, matrix, projectionValue);
        CubePipeline.WriteBuffer(projectionBuffer, projectionValue);

        CubePipeline.SetActiveBindGroups(objectIndex++);
        Renderer.Render(false);
    }

    function drawDrawer()
    {
        stack.Push();
        stack.Scale(drawerSize);
        drawObject(stack.Get(), drawerColor);
        stack.Pop();

        stack.Push();
        stack.Translate(handlePosition);
        stack.Scale(handleSize);
        drawObject(stack.Get(), handleColor);
        stack.Pop();
    }

    function drawCabinet()
    {
        stack.Push();
        stack.Scale(cabinetSize);
        drawObject(stack.Get(), cabinetColor);
        stack.Pop();

        const middle = cabinetSize[height] / 2 - drawerSize[height] / 2 - 5;

        for (let d = 0; d < drawersPerCabinet; ++d)
        {
            stack.Push();
            stack.Translate([0, d * drawerSpacing - middle, 3]);
            drawDrawer();
            stack.Pop();
        }
    }

    function drawCabinets()
    {
        for (let c = 0, s = 1; c < cabinets; ++c)
        {
            stack.Push();

            if (c)
            {
                const side = c % 2 * 2 - 1;
                const x = cabinetSpacing * side * s;
                stack.Translate([x, 0, 0]);
                s += ~-side / -2;
            }

            drawCabinet();
            stack.Pop();
        }
    }

    function render()
    {
        stack.Push();
        stack.RotateY(settings.baseRotation);

        objectIndex = 0;
        drawCabinets();
        stack.Pop();

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjection(false);
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
