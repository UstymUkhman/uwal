/**
 * @module Recursive Tree
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Stacks
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-matrix-stacks.html#a-recursive-tree}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 *
 * This approach uses 2 render pipelines with a shared `ShaderModuleDescriptor`
 * and switches between them at render time using `Pipeline.Active` flag.
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
        min: -360,
        max: 360,
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

    const cubeInfos = [], coneInfos = [];
    const branchSize = [20, 150, 20];
    const white = [1, 1, 1, 1];

    const treeDepth = 6;
    let cubeIndex = 0;
    let coneIndex = 0;

    const rotation = mat4.create();
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

    const moduleDescriptor =
    {
        primitive: { cullMode: "back" },
        fragment: CubePipeline.CreateFragmentState(module),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        vertex: CubePipeline.CreateVertexState(module, void 0, [
            cube.GetPositionBufferLayout(CubePipeline), colorLayout
        ])
    };

    cube.SetRenderPipeline(
        await Renderer.AddPipeline(CubePipeline, moduleDescriptor)
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
    const ConePipeline = await Renderer.CreatePipeline(moduleDescriptor);
    const coneVertexBuffer = ConePipeline.CreateVertexBuffer(vertexData);

    const { buffer: coneColorBuffer } = CubePipeline.CreateVertexBuffer(
        { name: "color", format: "unorm8x4" }, vertices
    );

    ConePipeline.SetVertexBuffers([coneVertexBuffer, coneColorBuffer]);
    ConePipeline.WriteBuffer(coneColorBuffer, coneColorData);
    ConePipeline.WriteBuffer(coneVertexBuffer, vertexData);
    CubePipeline.WriteBuffer(colorBuffer, colorData);

    // Initialize internal `Reflect` data:
    ConePipeline.CreateShaderModule(Cube);
    ConePipeline.SetDrawParams(vertices);
    cube.AddVertexBuffers(colorBuffer);

    function drawObject(matrix, ornament)
    {
        const Pipeline = ornament ? ConePipeline : CubePipeline;
        const index = ornament ? coneIndex : cubeIndex;
        const infos = ornament ? coneInfos : cubeInfos;

        // Create Object Info Function:
        if (index === infos.length)
        {
            const { projection: projectionValue, buffer: projectionBuffer } =
                Pipeline.CreateUniformBuffer("projection");

            const { color: colorValue, buffer: colorBuffer } =
                Pipeline.CreateUniformBuffer("color");

            Pipeline.AddBindGroups(
                Pipeline.CreateBindGroup(
                    Pipeline.CreateBindGroupEntries([
                        colorBuffer, projectionBuffer
                    ])
                )
            );

            infos.push({ projectionValue, projectionBuffer, colorValue, colorBuffer });
        }

        const { projectionValue, projectionBuffer, colorValue, colorBuffer } = infos[index];

        colorValue.set(white);
        Pipeline.SetActiveBindGroups(index);
        Pipeline.WriteBuffer(colorBuffer, colorValue);

        mat4.multiply(viewProjection, matrix, projectionValue);
        Pipeline.WriteBuffer(projectionBuffer, projectionValue);

        ornament ? coneIndex++ : cubeIndex++;
        CubePipeline.Active = !ornament;
        ConePipeline.Active = ornament;

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

        cubeIndex = coneIndex = 0;
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
