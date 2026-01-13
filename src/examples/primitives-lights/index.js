/**
 * @example Geometries / Lights
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by dmnsgn's "Primitive Geometry"
 * {https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.3.0
 * @license MIT
 */

import {
    Node,
    Mesh,
    Color,
    Scene,
    Device,
    Shaders,
    Materials,
    Geometries,
    BLEND_STATE,
    PerspectiveCamera
} from "#/index";

import BaseShader from "./Base.wgsl";
import UV from "/assets/images/uv.jpg";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {Mesh[]} */ let meshes = [];
/** @type {GPUTexture} */ let texture;
/** @type {ResizeObserver} */ let observer;
/** @type {Scene} */ const scene = new Scene();

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await Device.Renderer(canvas, "Geometries / Lights"));
    }
    catch (error)
    {
        alert(error);
    }

    const grid = new Node();
    const scene = new Scene();
    const wireResources = new Array(2);

    const Camera = new PerspectiveCamera();
    const BasePipeline = new Renderer.Pipeline();
    const WirePipeline = new Renderer.Pipeline();
    const material = new Materials.Color(0xffffff);

    const Texture = new (await Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(UV);
    texture = await Texture.CopyImageToTexture(source);

    const Geometry = new Geometries.Mesh("Dummy", "uint16");
    const wireModule = WirePipeline.CreateShaderModule(Shaders.Mesh);
    const baseModule = BasePipeline.CreateShaderModule([Shaders.Mesh, BaseShader]);

    const { mode, buffer: modeBuffer } = BasePipeline.CreateUniformBuffer("mode");
    let baseResources = [modeBuffer, Texture.CreateSampler(), texture.createView()];

    await Renderer.AddPipeline(WirePipeline, {
        vertex: WirePipeline.CreateVertexState(wireModule, Geometry.GetPositionBufferLayout(WirePipeline)),
        primitive: WirePipeline.CreatePrimitiveState("line-list"),
        depthStencil: WirePipeline.CreateDepthStencilState(),
        multisample: WirePipeline.CreateMultisampleState(),
        fragment: WirePipeline.CreateFragmentState(wireModule,
            WirePipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
        )
    });

    await Renderer.AddPipeline(BasePipeline, {
        fragment: BasePipeline.CreateFragmentState(baseModule, void 0, "baseFragment"),
        depthStencil: BasePipeline.CreateDepthStencilState(),
        multisample: BasePipeline.CreateMultisampleState(),
        vertex: BasePipeline.CreateVertexState(baseModule, [
            Geometry.GetPositionBufferLayout(BasePipeline, "vertexNormalUV"),
            Geometry.GetNormalBufferLayout(BasePipeline, "vertexNormalUV"),
            Geometry.GetUVBufferLayout(BasePipeline, "vertexNormalUV")
        ], "vertexNormalUV")
    });

    Camera.Position = [-8, 4, 8];
    scene.AddCamera(Camera);
    Camera.CullTest = 0;
    scene.Add(grid);

    function clean()
    {
        meshes.forEach(mesh => mesh.Destroy());
        cancelAnimationFrame(raf);
        scene.Children.splice(0);
        meshes.splice(0);
    }

    function start(g = 0)
    {
        const primitives = [
            // Geometries.Primitives.box,
            // () => Geometries.Primitives.circle({ closed: true }),
            // () => Geometries.Primitives.plane({ nx: 10, quads: true }),
            Geometries.Primitives.quad,
            null,
            Geometries.Primitives.plane,
            Geometries.Primitives.roundedRectangle,
            Geometries.Primitives.stadium,
            null,
            Geometries.Primitives.ellipse,
            Geometries.Primitives.disc,
            Geometries.Primitives.superellipse,
            Geometries.Primitives.squircle,
            Geometries.Primitives.annulus,
            Geometries.Primitives.reuleux,
            null,
            Geometries.Primitives.cube,
            Geometries.Primitives.roundedCube,
            null,
            Geometries.Primitives.sphere,
            Geometries.Primitives.icosphere,
            Geometries.Primitives.ellipsoid,
            null,
            Geometries.Primitives.cylinder,
            Geometries.Primitives.cone,
            Geometries.Primitives.capsule,
            Geometries.Primitives.torus,
            null,
            Geometries.Primitives.tetrahedron,
            Geometries.Primitives.icosahedron
        ];

        const gridSize = 6, halfSize = (gridSize - 1) * 0.5, offset = 1.5;

        meshes = primitives.map((primitive) =>
        {
            if (!primitive)
            {
                if (g % gridSize) g += gridSize - (g % gridSize);
                return;
            }

            const Geometry = new Geometries.Mesh("Cube", "uint16");
            const Primitive = Geometry.Primitive = primitive();
            const mesh = new Mesh(Geometry, material);

            mesh.SetRenderPipeline(WirePipeline);
            wireResources[1] = mesh.Material.ColorBuffer;

            mesh.SetRenderPipeline(BasePipeline, baseResources);
            Geometry.AddNormalBuffer(BasePipeline, Primitive.normals, "vertexNormalUV");
            Geometry.AddUVBuffer(BasePipeline, Primitive.uvs, "vertexNormalUV");

            mesh.Position = [
                (g % gridSize) * offset - halfSize * offset,
                0,
                ~~(g++ / gridSize) * offset,
            ];

            scene.Add(mesh);
            return mesh;
        });

        meshes = meshes.filter(Boolean);
        baseResources = wireResources.concat(baseResources);
        const halfGridSize = meshes.at(-1).Position[2] * 0.5;
        meshes.forEach((mesh) => mesh.Position[2] -= halfGridSize);

        raf = requestAnimationFrame(render);
    }

    function render(time)
    {
        time /= 1e3;
        mode.set([(time | 0) % 5]);

        const sin = (Math.sin(time) + 1) / 2;
        const x = -sin * 12 + 4;
        const y = sin * 2 + 2;

        Camera.Position = [x, y, 8];
        Camera.LookAt(grid.Position);
        BasePipeline.WriteBuffer(modeBuffer, mode);

        meshes.forEach(mesh =>
        {
            baseResources[0] = wireResources[0] = mesh.ProjectionBuffer;

            if (!mode[0])
            {
                mesh.Pipeline = BasePipeline;
                mesh.BindGroups = BasePipeline.SetBindGroupFromResources(baseResources);
                mesh.Geometry.CreateIndexBuffer(BasePipeline, mesh.Geometry.Primitive.cells);
            }

            if (mode[0] === 4)
            {
                mesh.Pipeline = WirePipeline;
                mesh.Geometry.CreateEdgeBuffer(WirePipeline);
                mesh.BindGroups = WirePipeline.SetBindGroupFromResources(wireResources);
            }
        });

        Renderer.Render(scene);
        raf = requestAnimationFrame(render);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, blockSize);
            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            Camera.UpdateViewProjectionMatrix();
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    meshes.forEach(mesh => mesh.Destroy());
    Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    meshes.splice(0);
    scene.Destroy();
    Device.Destroy(
        undefined,
        texture
    );
}
