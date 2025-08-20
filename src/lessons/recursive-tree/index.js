/**
 * @module Recursive Tree
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Stacks
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-stacks.html#a-recursive-tree}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 *
 * This approach uses one render pipeline with different vertex buffers and `DrawMethods` and switches
 * between them at render time using `Pipeline.SetVertexBuffers` and `Pipeline.SetIndexBuffer` methods.
 * @version 0.1.0
 * @license MIT
 */

import { Device, PerspectiveCamera, CubeGeometry, Utils } from "#/index";
import MatrixStack from "../matrix-stacks/MatrixStack";
import createConeVertices from "./ConeVertices";
import Cube from "../matrix-stacks/Cube.wgsl";
import { mat4, vec3 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.Renderer(
            canvas, "Recursive Tree", { alphaMode: "premultiplied" }
        ));
    }
    catch (error)
    {
        alert(error);
    }

    const settings =
    {
        rotationX: Utils.DegreesToRadians(20),
        rotationY: Utils.DegreesToRadians(10),
        baseRotation: 0,
        scale: 0.9
    };

    const radToDegOptions =
    {
        min: -180,
        max: 180,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const treeRadToDegOptions =
    {
        min: 0,
        max: 90,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const branchSize = [20, 150, 20];
    const white = [1, 1, 1, 1];
    const objectInfos = [];

    const treeDepth = 6;
    let objectIndex = 0;

    const stack = new MatrixStack();
    const gui = new GUI().onChange(render);

    gui.add(settings, 'scale', 0.1, 1.2);
    gui.add(settings, 'rotationX', treeRadToDegOptions);
    gui.add(settings, 'rotationY', treeRadToDegOptions);
    gui.add(settings, "baseRotation", radToDegOptions);

    const Camera = new PerspectiveCamera(60, 1, 2000);
    Camera.Position = [0, 450, 1e3]; Camera.LookAt([0, 450, 0]);
    const viewProjection = Camera.UpdateViewProjection(false);

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

    const cubeVertices = cube.UV.length / 2;
    const colorData = new Uint8Array(cubeVertices * 4);

    for (let v = 0, i = 0; v < cubeVertices; i = (++v / 4 | 0) * 3)
    {
        const color = colors.slice(i, i + 3);
        colorData.set(color, v * 4);
        colorData[v * 4 + 3] = 255;
    }

    const { vertexData, colorData: coneColorData, vertices } = createConeVertices(20, 60);
    const coneVertexBuffer = CubePipeline.CreateVertexBuffer(vertexData);

    const { buffer: coneColorBuffer } = CubePipeline.CreateVertexBuffer(
        { name: "color", format: "unorm8x4" }, vertices
    );

    CubePipeline.WriteBuffer(coneColorBuffer, coneColorData);
    CubePipeline.WriteBuffer(coneVertexBuffer, vertexData);
    CubePipeline.WriteBuffer(colorBuffer, colorData);
    cube.AddVertexBuffers(colorBuffer);

    const coneVertexBuffers = [coneVertexBuffer, coneColorBuffer];
    const cubeIndexBuffer = Object.values(CubePipeline.IndexBuffer);
    const cubeVertexBuffers = CubePipeline.VertexBuffers.map(({ buffer }) => buffer);

    function drawObject(matrix, ornament)
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

        colorValue.set(white);
        CubePipeline.WriteBuffer(colorBuffer, colorValue);

        mat4.multiply(viewProjection, matrix, projectionValue);
        CubePipeline.WriteBuffer(projectionBuffer, projectionValue);

        CubePipeline.SetVertexBuffers(ornament ? coneVertexBuffers : cubeVertexBuffers);
        CubePipeline.SetIndexBuffer(...(!ornament && cubeIndexBuffer || [void 0]));
        CubePipeline.SetActiveBindGroups(objectIndex++);

        Renderer.Render(false);
    }

    function drawBranch()
    {
        stack
            .Push()
            .Scale(branchSize)
            .Translate([0, 0.5, 0]);

        drawObject(stack.Get());
        stack.Pop();
    }

    function drawTreeLevel(offset, depth)
    {
        const s = offset ? settings.scale : 1;
        const y = offset ? branchSize[1] : 0;

        stack
            .Push()
            .Translate([0, y, 0])
            .RotateZ(offset * settings.rotationX)
            .RotateY(Math.abs(offset) * settings.rotationY)
            .Scale([s, s, s]);

        drawBranch();

        if (0 < depth)
        {
            drawTreeLevel(-1, depth - 1);
            drawTreeLevel( 1, depth - 1);
        }

        if (0 < offset && !depth)
        {
            const position = vec3.getTranslation(stack.Get());
            drawObject(mat4.translation(position), true);
        }

        stack.Pop();
    }

    function render()
    {
        stack.Push();
        stack.RotateY(settings.baseRotation);

        objectIndex = 0;
        drawTreeLevel(0, treeDepth);
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
