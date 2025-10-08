/**
 * @module Scene Graphs
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Scene Graphs
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.2.0
 * @license MIT
 */

import { Scene, Mesh, Color, Device, Shaders, MathUtils, Materials, Geometries, PerspectiveCamera } from "#/index";
import { addButtonLeftJustified } from "https://webgpufundamentals.org/webgpu/resources/js/gui-helpers.js";
import Cube from "./Cube.wgsl";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.Renderer(canvas, "Scene Graphs"));
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

    const materialColor = new Color();
    const drawerMaterial = new Materials.Mesh();
    const handleMaterial = new Materials.Mesh(materialColor.Set(0x7f7f7f));
    const cabinetMaterial = new Materials.Mesh(materialColor.Set(0xbfbfbf, 0xbf));

    const [width, height, depth] = [0, 1, 2];
    const alwaysShow = new Set([0, 1, 2]);
    const drawerSize = [40, 30, 50];
    const handleSize = [10, 2, 2];

    const drawersPerCabinet = 4;
    const animatedNodes = [];
    let wasRunning = false;

    let requestId, then;
    const cabinets = 5;
    let currentNode;
    let time = 0;

    const settings =
    {
        cameraRotation: MathUtils.DegreesToRadians(-45),
        animate: false,
        showMeshNodes: false,
        showAllTransforms: false,
        position: MathUtils.Vec3.create(),
        rotation: MathUtils.Vec3.create(),
        scale: MathUtils.Vec3.set(1, 1, 1)
    };

    const scene = new Scene();
    const gui = new GUI().onChange(requestRender);

    gui.add(settings, "cameraRotation", cameraRadToDegOptions).onChange(updateCameraRotation);
    gui.add(settings, "animate").onChange(v => transformFolder.enable(!v));
    gui.add(settings, "showMeshNodes").onChange(showMeshNodes);
    gui.add(settings, "showAllTransforms").onChange(showTransforms);

    const transformFolder = gui.addFolder("Orientation");
    transformFolder.onChange(() => (currentNode.Transform =
        [settings.position, settings.rotation, settings.scale]
    ));

    const transformControls = [
        transformFolder.add(settings.position, "0", -200, 200, 1).name("Position X"),
        transformFolder.add(settings.position, "1", -200, 200, 1).name("Position Y"),
        transformFolder.add(settings.position, "2", -200, 200, 1).name("Position Z"),

        transformFolder.add(settings.rotation, "0", radToDegOptions).name("Rotation X"),
        transformFolder.add(settings.rotation, "1", radToDegOptions).name("Rotation Y"),
        transformFolder.add(settings.rotation, "2", radToDegOptions).name("Rotation Z"),

        transformFolder.add(settings.scale, "0", 0.1, 100).name("Scale X"),
        transformFolder.add(settings.scale, "1", 0.1, 100).name("Scale Y"),
        transformFolder.add(settings.scale, "2", 0.1, 100).name("Scale Z")
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

    const Camera = new PerspectiveCamera();
    const CubeGeometry = new Geometries.Cube();
    const CubePipeline = new Renderer.Pipeline();

    const cabinetWidth = cabinetSize[width] + cabinetSpacing;
    const cameraOffsetX = cabinetWidth / 2 * (cabinets - 1) / 2 + 4;

    const module = CubePipeline.CreateShaderModule([Shaders.Cube, Cube]);
    const { layout: colorLayout, buffer: colorBuffer } = createVertexColors();

    await Renderer.AddPipeline(CubePipeline, {
        primitive: CubePipeline.CreatePrimitiveState(),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        fragment: CubePipeline.CreateFragmentState(module, void 0, void 0, "cubeFragment"),
        vertex: CubePipeline.CreateVertexState(module, [
            CubeGeometry.GetPositionBufferLayout(CubePipeline), colorLayout
        ], void 0, "cubeVertex"),
    });

    Array.from({ length: 5 }).forEach((_, c) => addCabinet(scene, c))
    const nodeButtons = addNodeGUI(gui.addFolder("Nodes"), scene);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    setCurrentNode(scene.Children[0]);
    showTransforms(false);
    showMeshNodes(false);

    function addNodeGUI(gui, node, last, prefix)
    {
        const nodes = [], empty = prefix === void 0;

        if (node.Label !== "Scene")
        {
            const label = `${empty ? "" : `${prefix}\u00a0+-`}${node.Label}`;
            nodes.push(addButtonLeftJustified(gui, label, () => setCurrentNode(node)));
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

    function updateCurrentNodeGUI()
    {
        const { Position, Rotation, Scaling } = currentNode;
        settings.position.set(Position);
        settings.rotation.set(Rotation);
        settings.scale.set(Scaling);
        transformFolder.updateDisplay();
    }

    function createVertexColors()
    {
        const vertices = 6 * 4, data = new Uint8Array(vertices * 4);

        const colors = [
            /* Top:   */ 200, 200,  70, /* Bottom: */ 90, 130, 110,
            /* Front: */  70, 200, 210, /* Back:  */ 160, 160, 220,
            /* Left:  */ 200, 70,  120, /* Right: */  80,  70, 200
        ];

        for (let v = 0, i = 0; v < vertices; i = (++v / 4 | 0) * 3)
        {
            data.set(colors.slice(i, i + 3), v * 4);
            data[v * 4 + 3] = 255;
        }

        return CubeGeometry.AddVertexBuffer(
            CubePipeline, data, { name: "color", format: "unorm8x4" }, void 0, "cubeVertex"
        );
    }

    function setCurrentNode(node)
    {
        currentNode = node;
        transformFolder.name(`Orientation: ${node.Label}`);
        updateCurrentNodeGUI();
    }

    function showTransforms(show)
    {
        transformControls.forEach((transform, t) =>
            transform.show(show || alwaysShow.has(t))
        );
    }

    function showMeshNodes(show)
    {
        for (const child of nodeButtons)
            if (child.domElement.textContent.includes("mesh"))
                child.show(show);
    }

    function addMesh(label, parent, transform, material)
    {
        // A default material is required to match the expected number of entries in the shader:
        const cube = new Mesh(CubeGeometry, material ?? drawerMaterial, label, parent);

        cube.SetRenderPipeline(CubePipeline);
        CubePipeline.AddVertexBuffers(colorBuffer);

        cube.Transform = transform;
        return cube;
    }

    function addDrawer(parent, index)
    {
        const label = `drawer${index}`;
        const middle = cabinetSize[height] / 2 -
            drawerSize[height] / 2 - 5;

        const drawer = addMesh(label, parent, [
            [0, drawerSpacing * index - middle, 3]
        ]);

        animatedNodes.push(drawer);

        addMesh(`${label}-drawer-mesh`, drawer, [
            void 0, void 0, drawerSize
        ], drawerMaterial);

        addMesh(`${label}-handle-mesh`, drawer, [
            handlePosition, void 0, handleSize
        ], handleMaterial);
    }

    function addCabinet(parent, index)
    {
        const label = `cabinet${index}`;

        const cabinet = addMesh(label, parent, [
            [index * cabinetSpacing, 0, 0]
        ]);

        addMesh(`${label}-mesh`, cabinet, [
            void 0, void 0, cabinetSize
        ], cabinetMaterial);

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
            MathUtils.Lerp(3, drawerSize[2] * 0.8, Math.sin(time + n) * 0.5 + 0.5)
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
        updateCurrentNodeGUI();
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
            scene.AddCamera(Camera);
        }

        requestRender();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
