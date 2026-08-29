import Sky from "/assets/images/qwantani";
import SkyBox from "./SkyBox.wgsl";
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

    const TorusGeometry = new UWAL.Geometries.Mesh("torus");
    const SkyboxPipeline = new Renderer.Pipeline();
    const Camera = new UWAL.PerspectiveCamera();
    const Torus = new UWAL.Mesh(TorusGeometry);
    const Scene = new UWAL.Scene();

    Torus.Scaling = 2.5;
    Scene.Add(Torus);

    const Texture = new (await UWAL.TextureUtils(Renderer));
    const MatcapMaterial = new UWAL.MatcapMaterial(Renderer);
    const sampler = Texture.CreateSampler({ filter: "linear" });
    const position = [4, 0, -2.96], rotation = [0, 0, 0], origin = [0, 0, 0];

    const skyboxModule = SkyboxPipeline.CreateShaderModule([UWAL.Shaders.Fullscreen, SkyBox]);
    const view = (await Texture.CreateCubeTexture(Sky)).createView({ dimension: "cube" });

    let { inverseViewProjection, buffer: inverseViewProjectionBuffer } =
        SkyboxPipeline.CreateUniformBuffer("inverseViewProjection");

    await MatcapMaterial.AddPipeline({
        primitive: MatcapMaterial.Pipeline.CreatePrimitiveState(),
        multisample: MatcapMaterial.Pipeline.CreateMultisampleState(),
        depthStencil: MatcapMaterial.Pipeline.CreateDepthStencilState(),
        vertex: { buffers: [
            TorusGeometry.GetPositionBufferLayout(MatcapMaterial.Pipeline),
            TorusGeometry.GetNormalBufferLayout(MatcapMaterial.Pipeline)
        ]}
    });

    Torus.SetRenderPipeline(MatcapMaterial.Pipeline,
        [Camera.SetRenderPipeline(MatcapMaterial.Pipeline),MatcapMaterial.ColorBuffer],
        [UWAL.BINDINGS.CAMERA_MATRIX, UWAL.BINDINGS.COLOR]
    );

    await Renderer.AddPipeline(SkyboxPipeline,
    {
        depthStencil: SkyboxPipeline.CreateDepthStencilState(void 0, void 0, "less-equal"),
        fragment: SkyboxPipeline.CreateFragmentState(skyboxModule),
        vertex: SkyboxPipeline.CreateVertexState(skyboxModule),
        multisample: SkyboxPipeline.CreateMultisampleState()
    });

    SkyboxPipeline.SetBindGroupFromResources([sampler, view, inverseViewProjectionBuffer]);
    SkyboxPipeline.SetDrawParams(3);

    function render(time)
    {
        time *= 0.0001;

        // Move the camera in circle from the origin, looking at the origin:
        // position[0] = Math.cos(time) * 5;
        // position[2] = Math.sin(time) * 5;

        rotation[0] = time * -1;
        rotation[1] = time * -2;

        Camera.Position = position;
        Torus.Rotation = rotation;
        Camera.LookAt(origin);

        // Camera's `ViewProjectionMatrix` is updated by the `LookAt` method, but its `WorldMatrix` is not.
        // In this case it's not important to get the initial direction correct because it's rotating anyway.
        // For a better precision, call `UpdateViewProjectionMatrix()` before inverting `ViewProjectionMatrix`.
        inverseViewProjection = Camera.GetInverseViewProjectionMatrix(origin, inverseViewProjection);
        SkyboxPipeline.WriteBuffer(inverseViewProjectionBuffer, inverseViewProjection);

        MatcapMaterial.Pipeline.Active = true;
        Renderer.Render(Scene, false);

        MatcapMaterial.Pipeline.Active = false;
        Renderer.Render();

        requestAnimationFrame(render);
    }

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Renderer.MultisampleTexture = Texture.CreateMultisampleTexture();
            Camera.AspectRatio = Renderer.AspectRatio;
            Scene.AddMainCamera(Camera);
            Camera.LookAt(origin);
        }

        requestAnimationFrame(render);
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
