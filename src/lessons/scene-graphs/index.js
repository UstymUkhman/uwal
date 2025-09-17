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

import { addButtonLeftJustified } from "https://webgpufundamentals.org/webgpu/resources/js/gui-helpers.js";
import { Device, PerspectiveCamera, Node, Mesh, Geometries, MathUtils } from "#/index";
import { mat4, vec3 } from "wgpu-matrix";
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

    const cabinetColor = [0.75, 0.75, 0.75, 0.75];
    const [width, height, depth] = [0, 1, 2];
    const handleColor = [0.5, 0.5, 0.5, 1];
    const alwaysShow = new Set([0, 1, 2]);

    const drawerColor = [1, 1, 1, 1];
    const drawerSize = [40, 30, 50];
    const handleSize = [10, 2, 2];
    const drawersPerCabinet = 4;

    const animatedNodes = [];
    let wasRunning = false;
    const objectInfos = [];

    let requestId, then;
    let objectIndex = 0;
    const cabinets = 5;

    const meshes = [];
    let currentNode;
    let time = 0;

    const settings =
    {
        cameraRotation: MathUtils.DegreesToRadians(-45),
        animate: false,
        showMeshNodes: false,
        showAllTransforms: false,
        translation: vec3.zero(),
        rotation: vec3.zero(),
        scale: vec3.create(1, 1, 1)
    };

    const stack = new Node();
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
    const cameraOffsetX = cabinetWidth / 2 * (cabinets - 1) / 2 + 4;

    const module = CubePipeline.CreateShaderModule(CubeShader);
    const bindGroups = (drawersPerCabinet * 2 + 1) * cabinets + 1;
    const { layout: colorLayout, buffer: colorBuffer } = createVertexColors();

    await Renderer.AddPipeline(CubePipeline, {
        primitive: { cullMode: "back" },
        fragment: CubePipeline.CreateFragmentState(module),
        depthStencil: CubePipeline.CreateDepthStencilState(),
        vertex: CubePipeline.CreateVertexState(module, [
            Mesh.GetPositionBufferLayout(CubePipeline), colorLayout
        ])
    });

    const Cube = new Mesh(CubeGeometry);
    Cube.SetRenderPipeline(CubePipeline);
    Cube.AddVertexBuffers(colorBuffer);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    for (let c = 0; c < cabinets; ++c)
        addCabinet(root, c);

    const nodesFolder = gui.addFolder("Nodes");
    const nodeButtons = addNodeGUI(nodesFolder, root);

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
            { name: "color", format: "unorm8x4" }, CubeGeometry.Vertices
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

    function addSceneNode(label, parent, transform)
    {
        // Would be: `const node = new Mesh(CubeGeometry);`
        // and `node.SetRenderPipeline(CubePipeline);`
        const node = new Node(label, parent);
        node.Transform = transform;
        return node;
    }

    function addCube(label, parent, transform, color)
    {
        meshes.push({ node: addSceneNode(label, parent, transform), color });
    }

    function addDrawer(parent, index)
    {
        const label = `drawer${index}`;
        const middle = cabinetSize[height] / 2 -
            drawerSize[height] / 2 - 5;

        const drawer = addSceneNode(label, parent, [
            [0, drawerSpacing * index - middle, 3]
        ]);

        animatedNodes.push(drawer);

        addCube(`${label}-drawer-mesh`, drawer, [
            void 0, void 0, drawerSize
        ], drawerColor);

        addCube(`${label}-handle-mesh`, drawer, [
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

    function drawObject(matrix, color)
    {
        // Create Object Info Function:
        if (objectIndex === objectInfos.length)
        {
            // Will be available as `node.ProjectionBuffer`:
            const { projection: projectionValue, buffer: projectionBuffer } =
                CubePipeline.CreateUniformBuffer("projection");

            // Will be available as `node.Material.ColorBuffer`:
            const { color: colorValue, buffer: colorBuffer } =
                CubePipeline.CreateUniformBuffer("color");

            CubePipeline.AddBindGroupFromResources([colorBuffer, projectionBuffer]);
            objectInfos.push({ projectionValue, projectionBuffer, colorValue, colorBuffer });
        }

        const { projectionValue, projectionBuffer, colorValue, colorBuffer } =
            objectInfos[objectIndex];

        colorValue.set(color);
        CubePipeline.WriteBuffer(colorBuffer, colorValue);

        mat4.multiply(viewProjection, matrix, projectionValue);
        CubePipeline.WriteBuffer(projectionBuffer, projectionValue);

        CubePipeline.SetActiveBindGroups(objectIndex);
        objectIndex = ++objectIndex % bindGroups;
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

        for (const mesh of meshes)
            drawObject(mesh.node.WorldMatrix, mesh.color);

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
