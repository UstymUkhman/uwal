/**
 * @module Scene Graphs
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Matrix Stacks
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.1.0
 * @license MIT
 */

import { Device, PerspectiveCamera, CubeGeometry } from "#/index";
import Cube from "../matrix-stacks/Cube.wgsl";
import { mat4, vec3 } from "wgpu-matrix";
import SceneNode from "./SceneNode";
import Transform from "./Transform";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.Renderer(
            canvas, "Scene Graphs", { alphaMode: "premultiplied" }
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
    const meshes = [];

    const stack = new SceneNode();
    const rotation = mat4.create();

    const gui = new GUI().onChange(render);
    const settings = { cameraRotation: 0 };
    gui.add(settings, "cameraRotation", radToDegOptions);

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

    const Camera = new PerspectiveCamera(60, 1, 2e3);
    let viewProjection = Camera.UpdateViewProjection();
    const cabinetWidth = cabinetSize[width] + cabinetSpacing;
    const cameraOffsetX = cabinetWidth / 2 * (cabinets - 1) / 2;

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

    function addSceneNode(label, parent, transform)
    {
        const node = new SceneNode(label, new Transform(...transform));
        if (parent) node.Parent = parent;
        return node;
    }

    function addCube(label, parent, transform, color)
    {
        const node = addSceneNode(label, parent, transform);
        const length = meshes.push({ node, color });
        return meshes[length - 1];
    }

    function addDrawer(parent, index)
    {
        const label = `drawer${index}`;
        const middle = cabinetSize[height] / 2 -
            drawerSize[height] / 2 - 5;

        const drawer = addSceneNode(label, parent, [
            [0, drawerSpacing * index - middle, 3]
        ]);

        addCube(`${label}-drawer-mesh`, drawer, [
            void 0, void 0, drawerSize
        ], drawerColor);

        addCube(`${label}-drawer-mesh`, drawer, [
            handlePosition, void 0, handleSize
        ], handleColor);
    }

    function addCabinet(parent, index)
    {
        const label = `cabinet${index}`;

        const cabinet = addSceneNode(label, parent, [
            [index * cabinetSpacing, 0, 0]
        ]);

        addCube(`${label}-mesh`, cabinet, [
            void 0, void 0, cabinetSize
        ], cabinetColor);

        for (let d = 0; d < drawersPerCabinet; ++d)
            addDrawer(cabinet, d);
    }

    const root = new SceneNode("root");

    for (let c = 0; c < cabinets; ++c)
        addCabinet(root, c);

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

    function drawMesh(mesh)
    {
        const { node, color } = mesh;
        drawObject(node.WorldMatrix, color);
    }

    function render()
    {
        Camera.ResetMatrix();
        Camera.Translate([cameraOffsetX, 20, 0]);
        Camera.RotateY(settings.cameraRotation);
        Camera.Translate([0, 0, 300]);

        viewProjection = Camera.UpdateViewProjection();
        root.UpdateWorldMatrix();

        for (const mesh of meshes)
            drawMesh(mesh);

        Renderer.Submit();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjection();
        }

        render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
