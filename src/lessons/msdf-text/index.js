import { Device, Shaders, BLEND_STATE } from "#/index";
import Font from "./ya-hei-ascii.json?url";
import MSDFText from "#/text/MSDFText";
import Text from "./Text.wgsl";

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

    const TextPipeline = new Renderer.Pipeline();
    const module = TextPipeline.CreateShaderModule([Shaders.Quad, Text]);

    await Renderer.AddPipeline(TextPipeline, {
        vertex: TextPipeline.CreateVertexState(module),
        fragment: TextPipeline.CreateFragmentState(module,
            TextPipeline.CreateColorTargetState(BLEND_STATE.ALPHA_ADDITIVE)
        ),
        primitive: TextPipeline.CreatePrimitiveState("triangle-strip", void 0, "uint32"),
        depthStencil: TextPipeline.CreateDepthStencilState(void 0, false)
    });

    const msdfText = new MSDFText();
    msdfText.SetRenderPipeline(TextPipeline);
    const font = await msdfText.LoadFont(Font);

    console.log(font);

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        TextPipeline.SetDrawParams(6);
        Renderer.Render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
