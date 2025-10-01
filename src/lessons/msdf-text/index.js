import Font from "./ya-hei-ascii.json?url";
import MSDFText from "#/text/MSDFText";
import { Device } from "#/index";

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

    const msdfText = new MSDFText();
    const TextPipeline = await msdfText.CreateRenderPipeline(Renderer);

    const font = await msdfText.LoadFont(Font);
    const text = msdfText.WriteString("UWAL", font);

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
