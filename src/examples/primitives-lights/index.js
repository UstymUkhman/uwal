/**
 * @example Primitives / Lights
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by dmnsgn's "Primitive Geometry"
 * {https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.5.0
 * @license MIT
 */

import Primitive from "./Primitive.wgsl";
import UV from "/assets/images/uv.jpg";
import * as UWAL from "#/index";

/** @type {number} */ let raf;
/** @type {Renderer} */ let Renderer;
/** @type {GPUTexture} */ let texture;
/** @type {ResizeObserver} */ let observer;
const Camera = new UWAL.PerspectiveCamera();
/** @type {Scene} */ const scene = new UWAL.Scene();

/** @param {HTMLCanvasElement} canvas */
export async function run(canvas)
{
    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Primitives / Lights"));
    }
    catch (error)
    {
        alert(error);
    }

    let PointLight, SpotLight, lastTime = 0;
    const { Vec2, Vec3 } = UWAL.MathUtils;
    const frequency = 8, amplitude = 2.4;
    let pointX, pointZ, spotX, spotZ;
    const startTime = Date.now();

    const grid = new UWAL.Node();
    const origin = Vec3.create();
    const position = Vec3.create();
    const direction = Vec2.create();

    const spotDirection = Vec2.create(-0.85, -1);
    const pointDirection = Vec2.create(0.85, -1);
    const BasePipeline = new Renderer.Pipeline();
    const WireMaterial = new UWAL.WireframeMaterial(Renderer);

    const Texture = new (await UWAL.TextureUtils(Renderer));
    const source = await Texture.CreateImageBitmap(UV);
    texture = await Texture.CopyImageToTexture(source);

    const baseModule = BasePipeline.CreateShaderModule([UWAL.Shaders.Light, UWAL.Shaders.Mesh, Primitive]);
    const { mode, buffer: modeBuffer } = BasePipeline.CreateUniformBuffer("mode");
    let baseResources = [modeBuffer, Texture.CreateSampler(), texture];
    const Geometry = new UWAL.Geometries.Mesh("Dummy", "uint16");

    WireMaterial.CameraMatrixBuffer = Camera.SetRenderPipeline(BasePipeline);
    WireMaterial.Color = new UWAL.Color(0xffffff);
    await WireMaterial.CreatePipeline({
        vertex: { buffers: [Geometry.GetPositionBufferLayout(WireMaterial.Pipeline)] }
    });

    await Renderer.AddPipeline(BasePipeline, {
        fragment: BasePipeline.CreateFragmentState(baseModule, "baseFragment"),
        depthStencil: BasePipeline.CreateDepthStencilState(),
        multisample: BasePipeline.CreateMultisampleState(),
        vertex: BasePipeline.CreateVertexState(baseModule, "baseVertex", [
            Geometry.GetPositionBufferLayout(BasePipeline, "baseVertex"),
            Geometry.GetNormalBufferLayout(BasePipeline, "baseVertex"),
            Geometry.GetUVBufferLayout(BasePipeline, "baseVertex")
        ])
    });

    scene.Add(grid);
    scene.AddMainCamera(Camera);
    Camera.Position = [-8, 4, 8];

    const baseBindings = WireMaterial.Bindings.concat(
        UWAL.BINDINGS.AMBIENT_LIGHT,
        UWAL.BINDINGS.DIRECTIONAL_LIGHT,
        UWAL.BINDINGS.POINT_LIGHT,
        UWAL.BINDINGS.SPOT_LIGHT,
        0, 1, 2
    );

    function createMeshes(gridSize, halfSize, offset, g = 0)
    {
        const { Pipeline, Resources, Bindings } = WireMaterial;

        [
            "box", "circle", "plane", "quad", null,
            "plane", "roundedRectangle", "stadium", null,
            "ellipse", "disc", "superellipse", "squircle", "annulus", "reuleux", null,
            "cube", "roundedCube", null,
            "sphere", "icosphere", "ellipsoid", null,
            "cylinder", "cone", "capsule", "torus", null,
            "tetrahedron", "icosahedron"
        ]
            .forEach((name, n) =>
            {
                if (!name)
                {
                    if (g % gridSize)
                        g += gridSize - (g % gridSize);

                    return;
                }

                const Geometry = new UWAL.Geometries.Mesh(void 0, "uint16");
                const mesh = new UWAL.Mesh(Geometry);

                if (n < 3)
                {
                    Geometry.Primitive = { name, args: n < 2 ? { closed: true } : { nx: 10, quads: true } };
                    mesh.SetRenderPipeline(Pipeline, Resources.filter(Boolean), Bindings.slice(1));
                    n !== 1 && mesh.Geometry.CreateEdgeBuffer(Pipeline, Geometry.Primitive?.cells, 4);
                }
                else
                {
                    Geometry.Primitive = { name, vertexEntry: "baseVertex", normals: true, uvs: true };
                    mesh.SetRenderPipeline(BasePipeline, baseResources.filter(Boolean), baseBindings.slice(1));
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

    function updateLights(time)
    {
        const progress = time * 0.2;
        const k = (progress | 0) % 2 * 2 - 1;
        Vec2.mulScalar(pointDirection, k, direction);

        const wiggle = Math.sin(progress * frequency) * amplitude;
        const deltaTime = (time - lastTime) * 1.8;
        const wiggleX = wiggle * -Math.SQRT1_2;
        const wiggleZ = wiggle * Math.SQRT1_2;

        pointX += deltaTime * direction[0];
        pointZ += deltaTime * direction[1];

        Vec3.set(pointX - wiggleX, 1, pointZ + wiggleZ, position);
        Vec2.mulScalar(spotDirection, k, direction);
        PointLight.Position = position;

        spotX += deltaTime * direction[0] * 0.8;
        spotZ += deltaTime * direction[1] * 0.8;

        Vec3.set(spotX + wiggleX, 1, spotZ + wiggleZ, position);
        SpotLight.Position = position;
    }

    function createLights(x)
    {
        const DirectionalLight = new UWAL.DirectionalLight([0, -1, -1]);
        PointLight = new UWAL.PointLight([pointX = -x, 1, pointZ = 0]);
        SpotLight = new UWAL.SpotLight([spotX = x, 1, spotZ = 0]);
        const AmbientLight = new UWAL.AmbientLight();

        SpotLight.LookAt([-1, -0.5, -1]);
        SpotLight.Limit = [
            UWAL.MathUtils.DegreesToRadians(15),
            UWAL.MathUtils.DegreesToRadians(30)
        ];

        DirectionalLight.Intensity = 0.2;
        AmbientLight.Intensity = 0.1;
        PointLight.Intensity = 0x400;
        SpotLight.Intensity = 0x800;

        baseResources = WireMaterial.Resources.concat(
            AmbientLight.SetRenderPipeline(BasePipeline),
            DirectionalLight.SetRenderPipeline(BasePipeline),
            PointLight.SetRenderPipeline(BasePipeline),
            SpotLight.SetRenderPipeline(BasePipeline),
            baseResources
        );
    }

    function start()
    {
        const gridSize = 6, halfSize = (gridSize - 1) * 0.5, offset = 1.5;
        raf = requestAnimationFrame(render);

        baseResources.length === 3 &&
            ~createLights(halfSize * -offset) &&
            ~createMeshes(gridSize, halfSize, offset);
    }

    function render()
    {
        const time = (Date.now() - startTime) * 5e-4;
        const sin = (Math.sin(time) + 1) * 0.5;

        let m = 0;
        updateLights(time);
        mode.set([(time | 0) % 5]);

        BasePipeline.WriteBuffer(modeBuffer, mode);
        Camera.Position = [-sin * 12 + 4, sin * 2 + 2, 8];
        const { Pipeline, Resources, Bindings } = WireMaterial;

        grid.Traverse(mesh =>
        {
            if (m++ < 4) return;
            const { cells } = mesh.Geometry.Primitive;
            WireMaterial.MeshMatrixBuffer = baseResources[0] = mesh.MatrixBuffer;

            if (!mode[0])
            {
                mesh.Pipeline = BasePipeline;
                mesh.Geometry.CreateIndexBuffer(BasePipeline, cells);
                mesh.BindGroups = BasePipeline.SetBindGroupFromResources(baseResources, baseBindings);
            }

            if (mode[0] === 4)
            {
                mesh.Pipeline = Pipeline;
                mesh.Geometry.CreateEdgeBuffer(Pipeline, cells);
                mesh.BindGroups = Pipeline.SetBindGroupFromResources(Resources, Bindings);
            }
        });

        lastTime = time;
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
            Camera.AutoUpdateWorldMatrix = true;
        }

        cancelAnimationFrame(raf), start();
    });

    observer.observe(document.body);
}

export function destroy()
{
    UWAL.Device.OnLost = () => void 0;
    cancelAnimationFrame(raf);
    observer.disconnect();
    Renderer.Destroy();
    Camera.Destroy();
    scene.Destroy();
    UWAL.Device.Destroy(
        undefined,
        texture
    );
}
