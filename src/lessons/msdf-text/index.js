import Font from "./ya-hei-ascii.json?url";
import { Device, Shaders } from "#/index";
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

    const TextPipeline = await Renderer.CreatePipeline([Shaders.Quad, Text]);

    const msdfText = new MSDFText();
    msdfText.SetRenderPipeline(TextPipeline);
    await msdfText.LoadFont(Font);

    TextPipeline.SetDrawParams(6);

    const observer = new ResizeObserver(entries =>
    {
        for (const entry of entries)
        {
            const { inlineSize, blockSize } = entry.contentBoxSize[0];
            Renderer.SetCanvasSize(inlineSize, blockSize);
        }

        Renderer.Render();
    });

    observer.observe(document.body);
})(
    /** @type {HTMLCanvasElement} */
    (document.getElementById("lesson"))
);
