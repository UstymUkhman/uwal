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

import Primitive from "./Primitive.wgsl";
import UV from "/assets/images/uv.jpg";
import * as UWAL from "#/index";

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

    let pointLight, spotLight;
    let startTime, lastTime = 0;
    const grid = new UWAL.Node();

    const { Vec2 } = UWAL.MathUtils;
    const direction = Vec2.create();
    let pointX, pointZ, spotX, spotZ;

    const wireResources = new Array(2);
    const amplitude = 2.4, frequency = 8;
    const origin = UWAL.MathUtils.Vec3.create();

    const Camera = new UWAL.PerspectiveCamera();
    const BasePipeline = new Renderer.Pipeline();
    const WirePipeline = new Renderer.Pipeline();

    const spotDirection = Vec2.create(-0.85, -1);
    const pointDirection = Vec2.create(0.85, -1);
    const material = new UWAL.Materials.Color(0xffffff);

    const Texture = new (await UWAL.Device.Texture(Renderer));
    const source = await Texture.CreateImageBitmap(UV);
    texture = await Texture.CopyImageToTexture(source);

    const baseModule = BasePipeline.CreateShaderModule([
        UWAL.Shaders.Camera, UWAL.Shaders.Light, UWAL.Shaders.Mesh, Primitive
    ]);

    const Geometry = new UWAL.Geometries.Mesh("Dummy", "uint16");
    const wireModule = WirePipeline.CreateShaderModule(UWAL.Shaders.Mesh);

    const { mode, buffer: modeBuffer } = BasePipeline.CreateUniformBuffer("mode");
    const { uCamera, buffer: cameraBuffer } = BasePipeline.CreateUniformBuffer("uCamera");
    const { uSpotLight, buffer: spotBuffer } = BasePipeline.CreateUniformBuffer("uSpotLight");
    const { uPointLight, buffer: pointBuffer } = BasePipeline.CreateUniformBuffer("uPointLight");
    const { uDirectionalLight, buffer: directionalBuffer } = BasePipeline.CreateUniformBuffer("uDirectionalLight");

    const lightResources = [cameraBuffer, spotBuffer, pointBuffer, directionalBuffer];
    let baseResources = [modeBuffer, Texture.CreateSampler(), texture.createView()];

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
            Geometry.GetPositionBufferLayout(BasePipeline, "baseVertex"),
            Geometry.GetNormalBufferLayout(BasePipeline, "baseVertex"),
            Geometry.GetUVBufferLayout(BasePipeline, "baseVertex")
        ], "baseVertex")
    });

    scene.Add(grid);
    Camera.CullTest = 0;
    scene.AddMainCamera(Camera);
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

        return halfSize * -offset;
    }

    function updateLights(time)
    {
        const progress = time * 0.2;
        const k = (progress | 0) % 2 * 2 - 1;
        Vec2.mulScalar(pointDirection, k, direction);

        const wiggle = Math.sin(progress * frequency) * amplitude;
        const deltaTime = (time - lastTime) * 1.8;

        pointX += deltaTime * direction[0];
        pointZ += deltaTime * direction[1];

        pointLight.Position[0] = pointX - wiggle * -Math.SQRT1_2;
        pointLight.Position[2] = pointZ + wiggle * Math.SQRT1_2;

        Vec2.mulScalar(spotDirection, k, direction);

        spotX += deltaTime * direction[0] * 0.8;
        spotZ += deltaTime * direction[1] * 0.8;

        spotLight.Position[0] = spotX + wiggle * -Math.SQRT1_2;
        spotLight.Position[2] = spotZ + wiggle * Math.SQRT1_2;

        uCamera.position.set(Camera.Position);
        uSpotLight.position.set(spotLight.Position);
        uPointLight.position.set(pointLight.Position);

        BasePipeline.WriteBuffer(cameraBuffer, uCamera.position);
        BasePipeline.WriteBuffer(spotBuffer, uSpotLight.position.buffer);
        BasePipeline.WriteBuffer(pointBuffer, uPointLight.position.buffer);
    }

    function createLights(x)
    {
        const directionalLight = new UWAL.DirectionalLight([0, -1, -1]);
        pointLight = new UWAL.PointLight([pointX = -x, 1, pointZ = 0]);
        spotLight = new UWAL.SpotLight([spotX = x, 1, spotZ = 0]);
        const rad15 = UWAL.MathUtils.DegreesToRadians(15);
        const rad30 = UWAL.MathUtils.DegreesToRadians(30);

        directionalLight.Intensity = 0.2;
        spotLight.Limit = [rad15, rad30];
        pointLight.Intensity = 0x400;
        spotLight.Intensity = 0x800;

        uDirectionalLight.intensity.set([directionalLight.Intensity]);
        uDirectionalLight.direction.set(directionalLight.Direction);
        uPointLight.intensity.set([pointLight.Intensity]);

        uSpotLight.direction.set(spotLight.LookAt([-1, -0.5, -1]));
        uSpotLight.intensity.set([spotLight.Intensity]);
        uSpotLight.limit.set(spotLight.Limit);

        BasePipeline.WriteBuffer(directionalBuffer, uDirectionalLight.direction.buffer);
    }

    function clean()
    {
        grid.Traverse(mesh => mesh.Destroy?.());
        cancelAnimationFrame(raf);
        grid.Children.splice(0);
    }

    function start()
    {
        startTime = Date.now();
        createLights(createMeshes());
        raf = requestAnimationFrame(render);
        baseResources.length === 3 && (baseResources = wireResources.concat(baseResources));
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
