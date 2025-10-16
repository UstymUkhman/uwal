import Font from "./ya-hei-ascii.json?url";
import CubeShader from "./Cube.wgsl";

import {
    Mesh,
    Scene,
    Device,
    Shaders,
    MSDFText,
    MathUtils,
    Geometries,
    PerspectiveCamera
} from "#/index";

(async function(canvas)
{
    /** @type {Renderer} */ let Renderer;

    try
    {
        Renderer = new (await Device.Renderer(canvas, "MSDF Text"));
    }
    catch (error)
    {
        alert(error);
    }

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

    const CubePipeline = new Renderer.Pipeline();
    const CubeGeometry = new Geometries.Cube();
    const Cube = new Mesh(CubeGeometry, null);

    const module = CubePipeline.CreateShaderModule(
        [Shaders.CubeVertex, CubeShader]
    );

    Cube.SetRenderPipeline(await Renderer.AddPipeline(CubePipeline, {
        depthStencil: CubePipeline.CreateDepthStencilState(),
        fragment: CubePipeline.CreateFragmentState(module),
        primitive: CubePipeline.CreatePrimitiveState(),
        vertex: CubePipeline.CreateVertexState(module,
            CubeGeometry.GetPositionBufferLayout(CubePipeline),
            void 0, "cubeVertex"
        )
    }));

    Cube.Transform = [[0, 0, -2.5], [0.625, -0.75, 0]];
    const Camera = new PerspectiveCamera();

    const Text = new MSDFText();
    const scene = new Scene();

    scene.AddCamera(Camera);
    scene.Add(Cube);

    await Text.CreateRenderPipeline(Renderer);
    const font = await Text.LoadFont(Font);

    const titleBuffer = Text.Write("UWAL", font, 0x005a9c, 0.08, true);
    const subtitleBuffer = Text.Write("Unopinionated WebGPU Abstraction Library", font, 0xffffff, 0.001, true);

    Text.SetTransform(MathUtils.Mat4.translate(MathUtils.Mat4.identity(), [0, 4, -12]), titleBuffer);
    Text.SetTransform(MathUtils.Mat4.translate(MathUtils.Mat4.identity(), [0, 0.18, -1]), subtitleBuffer);

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
            Text.UpdateFromCamera(Camera);
        }

        Renderer.Render(scene, false);
        Renderer.Render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
