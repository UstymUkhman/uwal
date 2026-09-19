import Matcap from "/assets/images/matcap.png";
import Normal from "/assets/images/normal.jpg";
import Lines from "/assets/images/lines.png";
import Sky from "/assets/images/qwantani";
import * as UWAL from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await UWAL.Renderer(canvas, "Matcap"));
    }
    catch (error)
    {
        alert(error);
    }

    const DiscGeometry = new UWAL.MeshGeometry({ name: "disc", args: { segments: 64, radius: 1.5 } });
    const PlaneGeometry = new UWAL.MeshGeometry({ name: "plane", args: { nx: 10, quads: true } });
    const CubeGeometry = new UWAL.MeshGeometry({ name: "roundedCube", args: { radius: 0.04 } });

    const Camera = new UWAL.PerspectiveCamera();
    const Plane = new UWAL.Mesh(PlaneGeometry);
    const Disc = new UWAL.Mesh(DiscGeometry);
    const Cube = new UWAL.Mesh(CubeGeometry);

    const Scene = new UWAL.Scene();
    Scene.Add([Plane, Disc, Cube]);
    let lastTime = 0, time = 0;
    Cube.Scaling = 2;

    const Skybox = new UWAL.Skybox(Renderer, Camera);
    const Texture = new (await UWAL.Texture(Renderer));
    const WireframeMaterial = new UWAL.WireframeMaterial(Renderer);
    const FlatMaterial = new UWAL.FlatMaterial(Renderer, { colorMap: true });
    const MatcapMaterial = new UWAL.MatcapMaterial(Renderer, { normalMap: true });
    const position = [4, 0, -2.96], rotation = [0, 0, 0], scaling = [2, 2, 1], origin = [0, 0, 0];

    async function createMeshes()
    {
        await Promise.all([
            Skybox.CreatePipeline(),

            WireframeMaterial.AddPipeline({
                vertex: { buffers: [PlaneGeometry.GetPositionBufferLayout(WireframeMaterial.Pipeline)] }
            }),

            FlatMaterial.AddPipeline({
                depthStencil: FlatMaterial.Pipeline.CreateDepthStencilState(),
                primitive: FlatMaterial.Pipeline.CreatePrimitiveState(void 0, "none"),
                fragment: { targets: [FlatMaterial.Pipeline.CreateColorTargetState(UWAL.BLEND_STATE.ALPHA_ADDITIVE)] },
                vertex: { buffers: [
                    DiscGeometry.GetPositionBufferLayout(FlatMaterial.Pipeline),
                    DiscGeometry.GetUVBufferLayout(FlatMaterial.Pipeline)
                ]}
            }),

            MatcapMaterial.AddPipeline({
                primitive: MatcapMaterial.Pipeline.CreatePrimitiveState(),
                depthStencil: MatcapMaterial.Pipeline.CreateDepthStencilState(),
                vertex: { buffers: [
                    CubeGeometry.GetPositionBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry()),
                    CubeGeometry.GetNormalBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry()),
                    CubeGeometry.GetUVBufferLayout(MatcapMaterial.Pipeline, MatcapMaterial.GetVertexEntry())
                ]}
            })
        ]);

        const bitmaps = await Promise.all([
            Texture.CreateImageBitmap(Lines),
            Texture.CreateImageBitmap(Normal),
            Texture.CreateImageBitmap(Matcap)
        ]);

        const [lines, normal, matcap] = await Promise.all(bitmaps.map(bitmap =>
            Texture.CopyImageToTexture(bitmap, { mipmaps: false })
        ));

        const commonBindings = [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.COLOR];
        const cameraBuffer = Camera.SetRenderPipeline(FlatMaterial.Pipeline);
        const sampler = Texture.CreateSampler();

        Plane.SetRenderPipeline(WireframeMaterial.Pipeline,
            [cameraBuffer, WireframeMaterial.ColorBuffer],
            commonBindings
        );

        Disc.SetRenderPipeline(FlatMaterial.Pipeline,
            [cameraBuffer, FlatMaterial.ColorBuffer, lines, sampler],
            [...commonBindings, UWAL.BINDINGS.COLOR_MAP, UWAL.BINDINGS.COLOR_MAP_SAMPLER]
        );

        Cube.SetRenderPipeline(MatcapMaterial.Pipeline,
            [cameraBuffer, MatcapMaterial.ColorBuffer, normal, sampler, matcap, sampler],
            [
                ...commonBindings,
                UWAL.BINDINGS.NORMAL_COLOR_MAP,
                UWAL.BINDINGS.NORMAL_MAP_SAMPLER,
                UWAL.BINDINGS.MATCAP_COLOR_MAP,
                UWAL.BINDINGS.MATCAP_MAP_SAMPLER
            ]
        );

        PlaneGeometry.CreateEdgeBuffer(WireframeMaterial.Pipeline, PlaneGeometry.Primitive?.cells, 4);
        Skybox.SetCubeTextureView(await Texture.CreateCubeTexture(Sky), sampler);
    }

    function render(delta)
    {
        time += (delta - lastTime) * 1e-4;

        const x = Math.cos(time) * 0.5;
        const y = Math.cos(time - Math.PI) * 0.5;

        const r = Math.cos(time);
        const g = Math.sin(time - 0.5235);
        const b = Math.sin(time - 2.618);

        position[0] = Math.cos(time) * 5;
        position[2] = Math.sin(time) * 5;

        rotation[0] = time * -1;
        rotation[1] = time * -2;

        scaling[0] = x + 2.5;
        scaling[1] = y + 2.5;

        FlatMaterial.Color = [r, g, b];
        Camera.Position = position;
        Cube.Rotation = rotation;
        Plane.Scaling = scaling;
        Disc.Rotation[2] = time;
        Camera.LookAt(origin);

        FlatMaterial.Pipeline.Active = false;
        Skybox.Render();

        FlatMaterial.Pipeline.Active = true;
        Renderer.Render(Scene);

        requestAnimationFrame(render);
        lastTime = delta;
    }

    const observer = new ResizeObserver(async entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Texture.CreateMultisampleTexture();
            Scene.AddMainCamera(Camera);
        }

        await createMeshes();
        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
