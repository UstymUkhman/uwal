/**
 * @module Making a Hand
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This lesson is reproduced from WebGPU Scene Graphs
 * {@link https://webgpufundamentals.org/webgpu/lessons/webgpu-scene-graphs.html#a-hand}&nbsp;
 * and developed by using a version listed below. Please note that this code
 * may be simplified in future thanks to more recent library APIs.
 * @version 0.1.0
 * @license MIT
 */

import { addButtonLeftJustified } from "https://webgpufundamentals.org/webgpu/resources/js/gui-helpers.js";
import { Device, PerspectiveCamera, CubeGeometry, Utils } from "#/index";
import SceneNode from "../scene-graphs/SceneNode";
import Transform from "../scene-graphs/Transform";
import Cube from "../matrix-stacks/Cube.wgsl";
import { mat4, vec3 } from "wgpu-matrix";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;
    canvas.style.backgroundColor = "#000";

    try
    {
        Renderer = new (await Device.Renderer(
            canvas, "Hand", { alphaMode: "premultiplied" }
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

    const [width, height, depth] = [0, 1, 2];
    const alwaysShow = new Set([0, 1, 3]);
    const white = [1.0, 1.0, 1.0, 1.0];

    let wasRunning = false;
    const objectInfos = [];
    let requestId, then;
    let objectIndex = 0;

    const meshes = [];
    let currentNode;
    let time = 0;

    const settings =
    {
        cameraRotation: Utils.DegreesToRadians(-45),
        animate: false,
        showMeshNodes: false,
        showAllTransforms: false,
        translation: vec3.zero(),
        rotation: vec3.zero(),
        scale: vec3.create(1, 1, 1)
    };

    const stack = new SceneNode();
    const root = new SceneNode("root");
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

    const Camera = new PerspectiveCamera(60, 1, 2e3);
    let viewProjection = Camera.UpdateViewProjection();

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const cube = new CubeGeometry();
    const bindGroups = 3 * 4 + 2 + 1;
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

    const rotation = [Utils.DegreesToRadians(15), 0, 0];
    const wrist = addSceneNode("wrist", root, [[0, -35, 0]]);
    const palm = addSceneNode("palm", wrist, [[0, 68, 0]]);

    const palmMesh = addSceneNode("palm-mesh", wrist, [
        void 0, void 0, [100, 100, 10]
    ]);

    addMesh(palmMesh, white);

    const animatedNodes =
    [
        wrist, palm,
        ...addFinger("thumb",         palm, 2, 20, [[-50, -8, 0], rotation]),
        ...addFinger("index finger",  palm, 3, 30, [[-25, -3, 0], rotation]),
        ...addFinger("middle finger", palm, 3, 35, [[ -0, -1, 0], rotation]),
        ...addFinger("ring finger",   palm, 3, 33, [[ 25, -2, 0], rotation]),
        ...addFinger("pinky",         palm, 3, 25, [[ 45, -6, 0], rotation])
    ];

    const nodesFolder = gui.addFolder("Nodes");
    const nodeButtons = addSceneNodeGUI(nodesFolder, root);

    setCurrentNode(root.Children[0]);
    showTransforms(false);
    showMeshNodes(false);

    function addSceneNodeGUI(gui, node, last, prefix)
    {
        const nodes = [], empty = prefix === void 0;

        if (node.Transform instanceof Transform)
        {
            const label = `${empty ? "" : `${prefix}\u00a0+-`}${node.Label}`;
            nodes.push(addButtonLeftJustified(gui, label, () => setCurrentNode(node)));
        }

        prefix = empty ? "" : `${prefix}${last ? "\u00a0\u00a0\u00a0" : "\u00a0|\u00a0"}`;

        nodes.push(...node.Children.map((child, c) =>
            addSceneNodeGUI(gui, child, c === node.Children.length - 1, prefix)
        ));

        return nodes.flat();
    }

    function updateCurrentNodeSettings()
    {
        const transform = currentNode.Transform;
        transform.Translation.set(settings.translation);
        transform.Rotation.set(settings.rotation);
        transform.Scale.set(settings.scale);
    }

    function updateCurrentNodeGUI()
    {
        const transform = currentNode.Transform;
        settings.translation.set(transform.Translation);
        settings.rotation.set(transform.Rotation);
        settings.scale.set(transform.Scale);
        transformFolder.updateDisplay();
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

    function addSceneNode(label, parent, transform = [])
    {
        const node = new SceneNode(label, new Transform(...transform));
        if (parent) node.Parent = parent;
        return node;
    }

    function addMesh(node, color)
    {
        const length = meshes.push({ node, color });
        return meshes[length - 1];
    }

    function addFinger(label, parent, segments, segmentHeight, transform)
    {
        const nodes = [];
        const baseLabel = label;

        for (let s = 0; s < segments; ++s)
        {
            const node = addSceneNode(label, parent, transform);
            const meshNode = addSceneNode(`${label}-mesh`, node, [
                void 0, void 0, [10, segmentHeight, 10]
            ]);

            label = `${baseLabel}-${s + 1}`;
            addMesh(meshNode, white);
            nodes.push(node);
            parent = node;

            transform = [
                [0, segmentHeight, 0],
                [Utils.DegreesToRadians(15), 0, 0]
            ];
        }

        return nodes;
    }

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

        CubePipeline.SetActiveBindGroups(objectIndex);
        objectIndex = ++objectIndex % bindGroups;
        Renderer.Render(false);
    }

    function requestRender()
    {
        if (!requestId) requestId = requestAnimationFrame(render);
    }

    function drawMesh(mesh)
    {
        drawObject(mesh.node.WorldMatrix, mesh.color);
    }

    function animate()
    {
        animatedNodes.forEach((node, n) => node.Transform.Rotation[0] =
            lerp(0, Math.PI * 0.25, Math.sin(time + n * 0.1) * 0.5 + 0.5)
        );
    }

    function render()
    {
        requestId = void 0;

        Camera.ResetMatrix();
        Camera.Translate([0, 20, 0]);
        Camera.RotateY(settings.cameraRotation);
        Camera.Translate([0, 0, 300]);

        viewProjection = Camera.UpdateViewProjection();
        root.UpdateWorldMatrix();

        for (const mesh of meshes)
            drawMesh(mesh);

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
