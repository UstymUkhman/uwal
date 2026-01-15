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

import * as UWAL from "#/index";
import UV from "/assets/images/uv.jpg";
import GeometryShader from "./Geometry.wgsl";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUTexture} */ let texture;
/** @type {ResizeObserver} */ let observer;
/** @type {Scene} */ const scene = new UWAL.Scene();

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.Device.Renderer(canvas, "Primitives / Lights"));
    }
    catch (error)
    {
        alert(error);
    }

    let startTime;
    const grid = new UWAL.Node();
    const wireResources = new Array(2);
    const origin = UWAL.MathUtils.Vec3.create();

    const Camera = new UWAL.PerspectiveCamera();
    const BasePipeline = new Renderer.Pipeline();
    const WirePipeline = new Renderer.Pipeline();
    const material = new UWAL.Materials.Color(0xffffff);

    const Texture = new (await UWAL.Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(UV);
    texture = await Texture.CopyImageToTexture(source);

    const Geometry = new UWAL.Geometries.Mesh("Dummy", "uint16");
    const wireModule = WirePipeline.CreateShaderModule(UWAL.Shaders.Mesh);
    const baseModule = BasePipeline.CreateShaderModule([UWAL.Shaders.Light, UWAL.Shaders.Mesh, GeometryShader]);

    const { DirectionalLight, buffer: directionalBuffer } = BasePipeline.CreateUniformBuffer("DirectionalLight");
    const { mode, buffer: modeBuffer } = BasePipeline.CreateUniformBuffer("mode");
    let baseResources = [modeBuffer, Texture.CreateSampler(), texture.createView()];

    const directionalLight = new UWAL.DirectionalLight([0, -1, -1]);
    DirectionalLight.intensity.set([directionalLight.Intensity]);
    DirectionalLight.direction.set(directionalLight.Direction);

    BasePipeline.WriteBuffer(directionalBuffer, DirectionalLight.direction.buffer);
    const lightResources = [directionalBuffer];

    await Renderer.AddPipeline(WirePipeline, {
        vertex: WirePipeline.CreateVertexState(wireModule, Geometry.GetPositionBufferLayout(WirePipeline)),
        primitive: WirePipeline.CreatePrimitiveState("line-list"),
        depthStencil: WirePipeline.CreateDepthStencilState(),
        multisample: WirePipeline.CreateMultisampleState(),
        fragment: WirePipeline.CreateFragmentState(wireModule,
            WirePipeline.CreateColorTargetState(UWAL.BLEND_STATE.ALPHA_ADDITIVE)
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
            UWAL.Geometries.Primitives.box,
            () => UWAL.Geometries.Primitives.circle({ closed: true }),
            () => UWAL.Geometries.Primitives.plane({ nx: 10, quads: true }),
            UWAL.Geometries.Primitives.quad,
            null,
            UWAL.Geometries.Primitives.plane,
            UWAL.Geometries.Primitives.roundedRectangle,
            UWAL.Geometries.Primitives.stadium,
            null,
            UWAL.Geometries.Primitives.ellipse,
            UWAL.Geometries.Primitives.disc,
            UWAL.Geometries.Primitives.superellipse,
            UWAL.Geometries.Primitives.squircle,
            UWAL.Geometries.Primitives.annulus,
            UWAL.Geometries.Primitives.reuleux,
            null,
            UWAL.Geometries.Primitives.cube,
            UWAL.Geometries.Primitives.roundedCube,
            null,
            UWAL.Geometries.Primitives.sphere,
            UWAL.Geometries.Primitives.icosphere,
            UWAL.Geometries.Primitives.ellipsoid,
            null,
            UWAL.Geometries.Primitives.cylinder,
            UWAL.Geometries.Primitives.cone,
            UWAL.Geometries.Primitives.capsule,
            UWAL.Geometries.Primitives.torus,
            null,
            UWAL.Geometries.Primitives.tetrahedron,
            UWAL.Geometries.Primitives.icosahedron
        ];

        primitives.forEach((primitive, p) =>
        {
            if (!primitive)
            {
                if (g % gridSize)
                        g += gridSize - (g % gridSize);

                return;
            }

            const Geometry = new UWAL.Geometries.Mesh(void 0, "uint16");
            const Primitive = Geometry.Primitive = primitive();
            const mesh = new UWAL.Mesh(Geometry, material);

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

            grid.Add(mesh);
        });

        grid.Position[2] = grid.Children.at(-1).Position[2] / -2;
    }

    function clean()
    {
        grid.Traverse(mesh => mesh.Destroy?.());
        cancelAnimationFrame(raf);
        grid.Children.splice(0);
    }

    function start()
    {
        createMeshes();
        startTime = Date.now();
        raf = requestAnimationFrame(render);
        baseResources.length === 3 && (baseResources = wireResources.concat(baseResources));
    }

    function render()
    {
        const time = (Date.now() - startTime) / 2e3;
        const sin = (Math.sin(time) + 1) / 2;
        let m = 0;

        mode.set([(time | 0) % 5]);
        BasePipeline.WriteBuffer(modeBuffer, mode);
        Camera.Position = [-sin * 12 + 4, sin * 2 + 2, 8];

        grid.Traverse((mesh) =>
        {
            if (m++ < 4) return;
            baseResources[0] = wireResources[0] = mesh.ProjectionBuffer;

            if (!mode[0])
            {
                mesh.Pipeline = BasePipeline;

                mesh.BindGroups = BasePipeline.SetBindGroups([
                    BasePipeline.CreateBindGroup(BasePipeline.CreateBindGroupEntries(baseResources)),
                    BasePipeline.CreateBindGroup(BasePipeline.CreateBindGroupEntries(lightResources), 1)
                ]);

                mesh.Geometry.CreateIndexBuffer(BasePipeline, mesh.Geometry.Primitive.cells);
            }

            if (mode[0] === 4)
            {
                mesh.Pipeline = WirePipeline;
                mesh.Geometry.CreateEdgeBuffer(WirePipeline);
                mesh.BindGroups = WirePipeline.SetBindGroupFromResources(wireResources);
            }
        });

        Camera.LookAt(origin);
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
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
        }

        clean(), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    scene.Destroy();
    UWAL.Device.Destroy(
        undefined,
        texture
    );
}
