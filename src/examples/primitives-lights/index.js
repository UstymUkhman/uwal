/**
 * @example Primitives / Lights
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by dmnsgn's "Primitive Geometry"
 * {https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @todo Should work with culling enabled.
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
        Renderer = new (await Device.Renderer(canvas, "Primitives / Lights"));
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

    scene.Add(grid);
    Camera.CullTest = 0;
    scene.AddCamera(Camera);
    Camera.Position = [-8, 4, 8];

    function createMeshes(g = 0)
    {
        const gridSize = 6, halfSize = (gridSize - 1) * 0.5, offset = 1.5;

        const primitives = [
            Geometries.Primitives.box,
            () => Geometries.Primitives.circle({ closed: true }),
            () => Geometries.Primitives.plane({ nx: 10, quads: true }),
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

        meshes = primitives.map((primitive, p) =>
        {
            if (!primitive)
            {
                if (g % gridSize)
                        g += gridSize - (g % gridSize);

                return;
            }

            const Geometry = new Geometries.Mesh(void 0, "uint16");
            const Primitive = Geometry.Primitive = primitive();
            const mesh = new Mesh(Geometry, material);

            mesh.SetRenderPipeline(WirePipeline);
            wireResources[1] = mesh.Material.ColorBuffer;

            if (p < 3)
                p !== 1 && mesh.Geometry.CreateEdgeBuffer(WirePipeline, 4);

            else
            {
                mesh.SetRenderPipeline(BasePipeline, baseResources.slice(-3));
                Geometry.AddNormalBuffer(BasePipeline, Primitive.normals, "vertexNormalUV");
                Geometry.AddUVBuffer(BasePipeline, Primitive.uvs, "vertexNormalUV");
            }

            mesh.Position = [
                (g % gridSize) * offset - halfSize * offset,
                0,
                ~~(g++ / gridSize) * offset,
            ];

            scene.Add(mesh);
            return mesh;
        });

        meshes = meshes.filter(Boolean);
        const halfGridSize = meshes.at(-1).Position[2] / 2;
        meshes.forEach((mesh) => mesh.Position[2] -= halfGridSize);
    }

    function clean()
    {
        meshes.forEach(mesh => mesh.Destroy());
        cancelAnimationFrame(raf);
        scene.Children.splice(0);
        meshes.splice(0);
    }

    function start()
    {
        createMeshes();
        raf = requestAnimationFrame(render);
        baseResources.length === 3 && (baseResources = wireResources.concat(baseResources));
    }

    function render(time)
    {
        time /= 1e3;
        mode.set([(time | 0) % 5]);
        const sin = (Math.sin(time) + 1) / 2;

        BasePipeline.WriteBuffer(modeBuffer, mode);
        Camera.Position = [-sin * 12 + 4, sin * 2 + 2, 8];

        for (let m = 3, l = meshes.length; m < l; ++m)
        {
            const mesh = meshes[m];
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
        }

        raf = requestAnimationFrame(render);
        Camera.LookAt(grid.Position);
        Renderer.Render(scene);
    }

    observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            let { inlineSize: width, blockSize } = entry.contentBoxSize[0];
            width = (width <= 960 && width) || width - Math.max(width * 0.15, 240);
            Renderer.SetCanvasSize(width, blockSize);
            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            Camera.AspectRatio = Renderer.AspectRatio;
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
