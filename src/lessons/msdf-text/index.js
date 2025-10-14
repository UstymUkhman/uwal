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

    const CubePipeline = new Renderer.Pipeline();
    const CubeGeometry = new Geometries.Cube();
    const Cube = new Mesh(CubeGeometry, null);

    Renderer.CreatePassDescriptor(
        Renderer.CreateColorAttachment(),
        Renderer.CreateDepthStencilAttachment()
    );

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

    const Camera = new PerspectiveCamera();
    const msdfText = new MSDFText();
    const scene = new Scene();

    Cube.Transform = [[0, 0, -2.5], [0.625, -0.75, 0]];
    await msdfText.CreateRenderPipeline(Renderer);
    scene.AddCamera(Camera); scene.Add(Cube);

    const text = msdfText.WriteString("UWAL", await msdfText.LoadFont(Font), 0xffffff, 0.08, true);
    msdfText.Transform = MathUtils.Mat4.translate(MathUtils.Mat4.identity(), [0, 4, -12]);
    msdfText.UpdateProjectionMatrix(Camera.LocalMatrix, Camera.ProjectionMatrix);

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
            Camera.AspectRatio = Renderer.AspectRatio;
            Camera.UpdateViewProjectionMatrix();
        }

        Renderer.Render(scene, false);
        Renderer.RenderPass.executeBundles([msdfText.RenderBundle]);
        Renderer.Submit();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
