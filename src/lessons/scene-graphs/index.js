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

import { Node, Mesh, Color, Device, Shaders, MathUtils, Materials, Geometries, PerspectiveCamera } from "#/index";
import { addButtonLeftJustified } from "https://webgpufundamentals.org/webgpu/resources/js/gui-helpers.js";
import CubeShader from "./Cube.wgsl";

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
    let objectIndex = 0;
    const cabinets = 5;
    let bindGroups = 0;

    const meshes = [];
    let currentNode;
    let time = 0;

    const settings =
    {
        cameraRotation: MathUtils.DegreesToRadians(-45),
        animate: false,
        showMeshNodes: false,
        showAllTransforms: false,
        translation: MathUtils.Vec3.create(),
        rotation: MathUtils.Vec3.create(),
        scale: MathUtils.Vec3.create(1, 1, 1)
    };

    const root = new Node("root");
    const gui = new GUI().onChange(requestRender);
    const lerp = (v1, v2, t) => (v2 - v1) * t + v1;

    gui.add(settings, "cameraRotation", cameraRadToDegOptions);
    gui.add(settings, "animate").onChange(v => transformFolder.enable(!v));
    gui.add(settings, "showMeshNodes").onChange(showMeshNodes);
    gui.add(settings, "showAllTransforms").onChange(showTransforms);

    const transformFolder = gui.addFolder("Orientation");
    transformFolder.onChange(updateCurrentNodeSettings);

    const transformControls = [
        transformFolder.add(settings.translation, "0", -200, 200, 1).name("Translation X"),
        transformFolder.add(settings.translation, "1", -200, 200, 1).name("Translation Y"),
        transformFolder.add(settings.translation, "2", -200, 200, 1).name("Translation Z"),

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

    let viewProjection = Camera.UpdateViewProjection();
    const cabinetWidth = cabinetSize[width] + cabinetSpacing;
    const totBindGroups = (drawersPerCabinet * 2 + 1) * cabinets;
    const cameraOffsetX = cabinetWidth / 2 * (cabinets - 1) / 2 + 4;

    const module = CubePipeline.CreateShaderModule([Shaders.Cube, CubeShader]);
    const { layout: colorLayout, buffer: colorBuffer } = createVertexColors();

    await Renderer.AddPipeline(CubePipeline, {
        fragment: CubePipeline.CreateFragmentState(module, void 0, void 0, "cubeFragment"),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        vertex: CubePipeline.CreateVertexState(module, [
            Mesh.GetPositionBufferLayout(CubePipeline), colorLayout
        ], void 0, "cubeVertex"),
        primitive: { cullMode: "back" }
    });

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    Array.from({ length: 5 }).forEach((_, c) => addCabinet(root, c))
    const nodeButtons = addNodeGUI(gui.addFolder("Nodes"), root);

    setCurrentNode(root.Children[0]);
    showTransforms(false);
    showMeshNodes(false);

    function addNodeGUI(gui, node, last, prefix)
    {
        const nodes = [], empty = prefix === void 0;

        if (node.Label !== "root")
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

    function updateCurrentNodeSettings()
    {
        const { Translation, Rotation, Scale } = currentNode;
        Translation.set(settings.translation);
        Rotation.set(settings.rotation);
        Scale.set(settings.scale);
    }

    function updateCurrentNodeGUI()
    {
        const { Translation, Rotation, Scale } = currentNode;
        settings.translation.set(Translation);
        settings.rotation.set(Rotation);
        settings.scale.set(Scale);
        transformFolder.updateDisplay();
    }

    function createVertexColors()
    {
        const { buffer, layout } = CubePipeline.CreateVertexBuffer(
            { name: "color", format: "unorm8x4" },
            CubeGeometry.Vertices, void 0, "cubeVertex"
        );

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

        CubePipeline.WriteBuffer(buffer, data);

        return { buffer, layout };
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
        const cube = new Mesh(CubeGeometry, material ?? new Materials.Mesh(), label, parent);

        cube.SetRenderPipeline(CubePipeline);
        cube.AddVertexBuffers(colorBuffer);

        material && meshes.push(cube);
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

    function drawObject(cube)
    {
        // Create Object Info Function:
        if (objectIndex === bindGroups)
        {
            CubePipeline.AddBindGroupFromResources([cube.ProjectionBuffer, cube.Material.ColorBuffer]);
            bindGroups = Math.min(++bindGroups, totBindGroups);
        }

        MathUtils.Mat4.multiply(viewProjection, cube.WorldMatrix, cube.Projection);
        CubePipeline.SetActiveBindGroups(objectIndex);
        objectIndex = ++objectIndex % totBindGroups;

        cube.Update();
        Renderer.Render(false);
    }

    function requestRender()
    {
        if (!requestId) requestId = requestAnimationFrame(render);
    }

    function animate()
    {
        animatedNodes.forEach((node, n) => node.Translation[2] =
            lerp(3, drawerSize[2] * 0.8, Math.sin(time + n) * 0.5 + 0.5)
        );
    }

    function render()
    {
        requestId = void 0;

        Camera.ResetMatrix();
        Camera.Translate([cameraOffsetX, 20, 0]);
        Camera.RotateY(settings.cameraRotation);
        Camera.Translate([0, 0, 300]);

        viewProjection = Camera.UpdateViewProjection();
        root.UpdateWorldMatrix();

        meshes.forEach(mesh => drawObject(mesh));
        Renderer.Submit();

        const isRunning = settings.animate;
        const now = performance.now() * 0.001;
        const deltaTime = wasRunning && now - then || 0;

        then = now;
        if (isRunning) time += deltaTime;

        wasRunning = isRunning;
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
            Camera.UpdateViewProjection();
        }

        requestRender();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
