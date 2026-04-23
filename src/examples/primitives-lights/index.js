/**
 * @example Primitives / Lights
 * @author Ustym Ukhman <ustym.ukhman@gmail.com>
 * @description This example is inspired by dmnsgn's "Primitive Geometry"
 * {https://dmnsgn.github.io/primitive-geometry/} and developed using the version listed below.
 * Please note that this code may be simplified in the future thanks to more recent library APIs.
 * @version 0.3.1
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
        Renderer = new (await UWAL.Device.Renderer(canvas, "Primitives / Lights"));
    }
    catch (error)
    {
        alert(error);
    }

    let PointLight, SpotLight, lastTime = 0;
    const { Vec2, Vec3 } = UWAL.MathUtils;
    const frequency = 8, amplitude = 2.4;
    const startTime = Date.now();

    const grid = new UWAL.Node();
    const origin = Vec3.create();
    const position = Vec3.create();
    const direction = Vec2.create();

    const BasePipeline = new Renderer.Pipeline();
    const WirePipeline = new Renderer.Pipeline();

    const spotDirection = Vec2.create(-0.85, -1);
    const pointDirection = Vec2.create(0.85, -1);
    let wireBindings, pointX, pointZ, spotX, spotZ;

    const Texture = new (await UWAL.Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(UV);
    texture = await Texture.CopyImageToTexture(source);

    const baseModule = BasePipeline.CreateShaderModule([
        UWAL.Shaders.Light, UWAL.Shaders.Mesh, Primitive
    ]);

    const wireModule = WirePipeline.CreateShaderModule(UWAL.Shaders.Mesh);
    const { mode, buffer: modeBuffer } = BasePipeline.CreateUniformBuffer("mode");
    const { color, buffer: colorBuffer } = WirePipeline.CreateUniformBuffer("color");

    color.set(new UWAL.Color(0xffffff).rgba);
    WirePipeline.WriteBuffer(colorBuffer, color.buffer);
    const Geometry = new UWAL.Geometries.Mesh("Dummy", "uint16");

    let baseResources = [modeBuffer, Texture.CreateSampler(), texture.createView()];
    const wireResources = [void 0, colorBuffer, Camera.SetRenderPipeline(BasePipeline)];

    const baseBindings = (wireBindings = [
        UWAL.BINDINGS.MESH_MATRIX, UWAL.BINDINGS.MESH_COLOR, UWAL.BINDINGS.CAMERA_MATRIX
    ]).concat(UWAL.BINDINGS.DIRECTIONAL_LIGHT, UWAL.BINDINGS.POINT_LIGHT, UWAL.BINDINGS.SPOT_LIGHT, 0, 1, 2);

    await Renderer.AddPipeline(WirePipeline, {
        vertex: WirePipeline.CreateVertexState(wireModule, void 0, Geometry.GetPositionBufferLayout(WirePipeline)),
        primitive: WirePipeline.CreatePrimitiveState("line-list"),
        depthStencil: WirePipeline.CreateDepthStencilState(),
        multisample: WirePipeline.CreateMultisampleState(),
        fragment: WirePipeline.CreateFragmentState(wireModule, void 0,
            WirePipeline.CreateColorTargetState(UWAL.BLEND_STATE.ALPHA_ADDITIVE)
        )
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

    function createMeshes(gridSize, halfSize, offset, g = 0)
    {
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
            const resources = wireResources.filter(Boolean);

            const mesh = new UWAL.Mesh(Geometry);
            mesh.SetRenderPipeline(WirePipeline, resources, wireBindings.slice(1));

            if (p < 3)
                p !== 1 && mesh.Geometry.CreateEdgeBuffer(WirePipeline, 4);

            else
            {
                mesh.SetRenderPipeline(BasePipeline, baseResources.filter(Boolean), baseBindings.slice(1));
                Geometry.AddNormalBuffer(BasePipeline, Primitive.normals, "baseVertex");
                Geometry.AddUVBuffer(BasePipeline, Primitive.uvs, "baseVertex");
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

        const rad15 = UWAL.MathUtils.DegreesToRadians(15);
        const rad30 = UWAL.MathUtils.DegreesToRadians(30);

        SpotLight.LookAt([-1, -0.5, -1]);
        SpotLight.Limit = [rad15, rad30];

        DirectionalLight.Intensity = 0.2;
        PointLight.Intensity = 0x400;
        SpotLight.Intensity = 0x800;

        baseResources = wireResources.concat(
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

        grid.Traverse(mesh =>
        {
            if (m++ < 4) return;
            baseResources[0] = wireResources[0] = mesh.MatrixBuffer;

            if (!mode[0])
            {
                mesh.Pipeline = BasePipeline;
                mesh.Geometry.CreateIndexBuffer(BasePipeline, mesh.Geometry.Primitive.cells);
                mesh.BindGroups = BasePipeline.SetBindGroupFromResources(baseResources, baseBindings);
            }

            if (mode[0] === 4)
            {
                mesh.Pipeline = WirePipeline;
                mesh.Geometry.CreateEdgeBuffer(WirePipeline);
                mesh.BindGroups = WirePipeline.SetBindGroupFromResources(wireResources, wireBindings);
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
