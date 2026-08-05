/**
 * @module Scene Graphs
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Scene Graphs
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html}&nbsp;
 * and developed using the version listed below. Please note that this code
 * may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import { addButtonLeftJustified } from "https://webgpufundamentals.org/webgpu/resources/js/gui-helpers.js";
import TransformHelper from "./TransformHelper";
import * as UWAL from "#/index";
import Cube from "./Cube.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Scene Graphs"));
    }
    catch (error)
    {
        alert(error);
    }

    const radToDegOptions =
    {
        min: -90,
        max: 90,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const cameraRadToDegOptions =
    {
        min: -180,
        max: 180,
        step: 1,
        converters: GUI.converters.radToDeg
    };

    const selected = '➡️';
    const unselected = '\u3000';
    const prefixRE = new RegExp(`^(?:${unselected}|${selected})`);

    const [width, height, depth] = [0, 1, 2];
    const alwaysShow = new Set([0, 1, 2]);
    const drawerSize = [40, 30, 50];
    const handleSize = [10, 2, 2];

    const drawersPerCabinet = 4;
    const animatedNodes = [];
    let wasRunning = false;

    let requestId, then;
    const cabinets = 5;
    let time = 0;

    const settings =
    {
        cameraRotation: UWAL.MathUtils.DegreesToRadians(-45),
        animate: false,
        showMeshNodes: false,
        showAllTransforms: false
    };

    const scene = new UWAL.Scene();
    const gui = new GUI().onChange(requestRender);
    const transformHelper = new TransformHelper();

    gui.add(settings, "cameraRotation", cameraRadToDegOptions).onChange(updateCameraRotation);
    gui.add(settings, "animate").onChange(v => transformFolder.enable(!v));
    gui.add(settings, "showMeshNodes").onChange(showMeshNodes);
    gui.add(settings, "showAllTransforms").onChange(showTransforms);
    const transformFolder = gui.addFolder("Orientation");

    const transformControls = [
        transformFolder.add(transformHelper, "PositionX", -200, 200, 1),
        transformFolder.add(transformHelper, "PositionY", -200, 200, 1),
        transformFolder.add(transformHelper, "PositionZ", -200, 200, 1),

        transformFolder.add(transformHelper, "RotationX", radToDegOptions),
        transformFolder.add(transformHelper, "RotationY", radToDegOptions),
        transformFolder.add(transformHelper, "RotationZ", radToDegOptions),

        transformFolder.add(transformHelper, "ScaleX", 0.1, 100),
        transformFolder.add(transformHelper, "ScaleY", 0.1, 100),
        transformFolder.add(transformHelper, "ScaleZ", 0.1, 100)
    ];

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

    const CubeGeometry = new UWAL.Geometries.Mesh("Cube", "uint16");
    const CubePipeline = new Renderer.Pipeline();
    const Camera = new UWAL.PerspectiveCamera();
    const color = new UWAL.Color(0xffffff);
    CubeGeometry.Primitive = "cube";

    const cabinetWidth = cabinetSize[width] + cabinetSpacing;
    const cameraOffsetX = cabinetWidth / 2 * (cabinets - 1) / 2 + 4;
    const module = CubePipeline.CreateShaderModule([UWAL.Shaders.Mesh, Cube]);

    const colorAttribute = { name: "color", format: "unorm8x4" };
    const cameraBuffer = Camera.SetRenderPipeline(CubePipeline);
    const colorBuffer = createVertexColors(colorAttribute);

    await Renderer.AddPipeline(CubePipeline, {
        primitive: CubePipeline.CreatePrimitiveState(),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        fragment: CubePipeline.CreateFragmentState(module, "cubeFragment"),
        vertex: CubePipeline.CreateVertexState(module, "cubeVertex", [
            CubeGeometry.GetPositionBufferLayout(CubePipeline),
            CubePipeline.CreateVertexBufferLayout(colorAttribute, "cubeVertex")
        ])
    });

    const { color: drawerColor, buffer: drawerBuffer } = CubePipeline.CreateUniformBuffer("color");
    const { color: handleColor, buffer: handleBuffer } = CubePipeline.CreateUniformBuffer("color");
    const { color: cabinetColor, buffer: cabinetBuffer } = CubePipeline.CreateUniformBuffer("color");

    drawerColor.set(color.rgba);
    CubePipeline.WriteBuffer(drawerBuffer, drawerColor.buffer);

    handleColor.set(color.Set(0x7f7f7f).rgba);
    CubePipeline.WriteBuffer(handleBuffer, handleColor.buffer);

    cabinetColor.set(color.Set(0xbfbfbf, 0xbf).rgba);
    CubePipeline.WriteBuffer(cabinetBuffer, cabinetColor.buffer);

    Array.from({ length: cabinets }).forEach((_, c) => addCabinet(scene, c));
    const nodeButtons = addNodeGUI(gui.addFolder("Nodes"), scene);

    setCurrentNode(scene.Children[0]);
    showTransforms(false);
    showMeshNodes(false);

    function addNodeGUI(gui, node, last, prefix)
    {
        const nodes = [], empty = prefix === void 0;

        if (node.Label !== "Scene")
        {
            const label = `${empty ? "" : `${prefix}\u00a0+-`}${node.Label}`;
            nodes.push({ node, button: addButtonLeftJustified(gui, label, () => setCurrentNode(node)) });
        }

        prefix = empty ? "" : `${prefix}${last ? "\u00a0\u00a0\u00a0" : "\u00a0|\u00a0"}`;

        nodes.push(...node.Children.map((child, c) =>
            addNodeGUI(gui, child, c === node.Children.length - 1, prefix)
        ));

        return nodes.flat();
    }

    function updateCameraRotation(rotation)
    {
        Camera.Transform = [[cameraOffsetX, 20, 0], [0, rotation, 0]];
        Camera.Position = [0, 0, 300];
        Camera.UpdateViewProjectionMatrix();
    }

    function createVertexColors(attribute)
    {
        const vertices = 6 * 4, data = new Uint8Array(vertices * 4);

        const colors = [
            /* Front: */  70, 200, 210, /* Back:  */ 160, 160, 220,
            /* Left:  */ 200,  70, 120, /* Right: */  80,  70, 200,
            /* Top:   */ 200, 200,  70, /* Bottom: */ 90, 130, 110
        ];

        for (let v = 0, i = 0; v < vertices; i = (++v / 4 | 0) * 3)
        {
            data.set(colors.slice(i, i + 3), v * 4);
            data[v * 4 + 3] = 255;
        }

        const { buffer } = CubePipeline.CreateVertexBuffer(attribute, vertices, "cubeVertex");
        CubePipeline.WriteBuffer(buffer, data);
        return buffer;
    }

    function setCurrentNode(node)
    {
        transformHelper.Node = node;
        transformFolder.name(`Orientation: ${node.Label}`);
        transformFolder.updateDisplay();

        // Mark selected node:
        for (const button of nodeButtons)
        {
            const name = button.button.getName().replace(prefixRE, '');
            button.button.name(`${button.node === node ? selected : unselected}${name}`);
        }
    }

    function showTransforms(show)
    {
        transformControls.forEach((transform, t) =>
            transform.show(show || alwaysShow.has(t))
        );
    }

    function showMeshNodes(show)
    {
        for (const { node, button } of nodeButtons)
            if (node.Label.includes("mesh"))
                button.show(show);
    }

    function addMesh(label, parent, transform, buffer)
    {
        const cube = new UWAL.Mesh(CubeGeometry, label, parent);

        cube.SetRenderPipeline(
            CubePipeline,
            [cameraBuffer, buffer],
            [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.MESH_COLOR]
        );

        CubePipeline.AddVertexBuffers(colorBuffer);
        cube.Transform = transform;
        return cube;
    }

    function addDrawer(parent, index)
    {
        const label = `drawer${index}`;
        const middle = cabinetSize[height] / 2 -
            drawerSize[height] / 2 - 5;

        const drawer = new UWAL.Node(label, parent);
        drawer.Position = [0, drawerSpacing * index - middle, 3];

        animatedNodes.push(drawer);

        addMesh(`${label}-drawer-mesh`, drawer, [
            void 0, void 0, drawerSize
        ], drawerBuffer);

        addMesh(`${label}-handle-mesh`, drawer, [
            handlePosition, void 0, handleSize
        ], handleBuffer);
    }

    function addCabinet(parent, index)
    {
        const label = `cabinet${index}`;

        const cabinet = new UWAL.Node(label, parent);
        cabinet.Position = [index * cabinetSpacing, 0, 0];

        addMesh(`${label}-mesh`, cabinet, [
            void 0, void 0, cabinetSize
        ], cabinetBuffer);

        for (let d = 0; d < drawersPerCabinet; ++d)
            addDrawer(cabinet, d);
    }

    function requestRender()
    {
        if (!requestId) requestId = requestAnimationFrame(render);
    }

    function animate()
    {
        animatedNodes.forEach((node, n) => node.Position[2] =
            UWAL.MathUtils.Lerp(3, drawerSize[2] * 0.8, Math.sin(time + n) * 0.5 + 0.5)
        );
    }

    function render()
    {
        requestId = void 0;
        Renderer.Render(scene);

        const isRunning = settings.animate;
        const now = performance.now() * 0.001;
        const deltaTime = wasRunning && now - then || 0;

        then = now;
        wasRunning = isRunning;

        if (isRunning) time += deltaTime;
        if (!settings.animate) return;

        animate();
        requestRender();
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            updateCameraRotation(settings.cameraRotation);
            scene.AddMainCamera(Camera);
        }

        requestRender();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
